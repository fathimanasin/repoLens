import json
import uuid
from datetime import datetime, timezone


async def store_analysis_results(
    repository_id: str,
    branch: str,
    commit_sha: str,
    metrics: dict,
    snapshot: dict,
    pool,
) -> dict:
    """
    Inserts RepositoryAnalysis, checks for drift against previous analysis,
    creates DriftEvent if applicable, updates Repository.

    Returns:
    {
        "analysis_id": str,
        "drift_event_id": str | None
    }
    """

    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).replace(
    tzinfo=None
)

    combined_metrics = {
        **metrics,
        "snapshot": snapshot,
    }

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                INSERT INTO "RepositoryAnalysis"
                (
                    id,
                    status,
                    commit_sha,
                    branch,
                    architecture_score,
                    metrics,
                    started_at,
                    completed_at,
                    created_at,
                    repository_id
                )
                VALUES
                (
                    $1,
                    'COMPLETE',
                    $2,
                    $3,
                    $4,
                    $5::jsonb,
                    $6,
                    $6,
                    $6,
                    $7
                )
                """,
                analysis_id,
                commit_sha,
                branch,
                metrics["architecture_score"],
                json.dumps(combined_metrics),
                now,
                repository_id,
            )

            previous = await conn.fetchrow(
                """
                SELECT
                    id,
                    architecture_score,
                    metrics
                FROM "RepositoryAnalysis"
                WHERE repository_id = $1
                  AND status = 'COMPLETE'
                  AND id != $2
                ORDER BY created_at DESC
                LIMIT 1
                """,
                repository_id,
                analysis_id,
            )

            drift_event_id = None

            if (
                previous is not None
                and previous["architecture_score"] is not None
            ):
                delta = (
                    metrics["architecture_score"]
                    - previous["architecture_score"]
                )

                if abs(delta) >= 1:
                    severity = (
                        "CRITICAL"
                        if abs(delta) >= 20
                        else "WARNING"
                        if abs(delta) >= 10
                        else "INFO"
                    )

                    drift_event_id = str(uuid.uuid4())

                    direction = (
                        "dropped"
                        if delta < 0
                        else "improved"
                    )

                    title = (
                        f"Architecture score "
                        f"{direction} by "
                        f"{abs(delta):.1f} points"
                    )

                    description = (
                        f"Score changed from "
                        f"{previous['architecture_score']:.1f} "
                        f"to "
                        f"{metrics['architecture_score']:.1f} "
                        f"between commits."
                    )

                    await conn.execute(
                        """
                        INSERT INTO "DriftEvent"
                        (
                            id,
                            severity,
                            title,
                            description,
                            metadata,
                            created_at,
                            repository_id,
                            analysis_id
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5::jsonb,
                            $6,
                            $7,
                            $8
                        )
                        """,
                        drift_event_id,
                        severity,
                        title,
                        description,
                        json.dumps(
                            {
                                "scoreDelta": delta,
                                "previousScore":
                                    previous["architecture_score"],
                                "newScore":
                                    metrics["architecture_score"],
                            }
                        ),
                        now,
                        repository_id,
                        analysis_id,
                    )

            drift_status = "NONE"

            if drift_event_id is not None:
                drift_status = (
                    "CRITICAL"
                    if abs(delta) >= 20
                    else "DETECTED"
                )

            await conn.execute(
                """
                UPDATE "Repository"
                SET
                    architecture_score = $1,
                    analysis_status = 'COMPLETE',
                    drift_status = $2,
                    last_commit_sha = $3,
                    updated_at = $4
                WHERE id = $5
                """,
                metrics["architecture_score"],
                drift_status,
                commit_sha,
                now,
                repository_id,
            )

    return {
        "analysis_id": analysis_id,
        "drift_event_id": drift_event_id,
    }


async def mark_analysis_failed(
    repository_id: str,
    error_message: str,
    pool,
) -> None:
    now = datetime.now(timezone.utc).replace(
    tzinfo=None
)

    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO "RepositoryAnalysis"
            (
                id,
                status,
                commit_sha,
                branch,
                error_message,
                started_at,
                completed_at,
                created_at,
                repository_id
            )
            VALUES
            (
                $1,
                'FAILED',
                'unknown',
                'unknown',
                $2,
                $3,
                $3,
                $3,
                $4
            )
            """,
            str(uuid.uuid4()),
            error_message,
            now,
            repository_id,
        )

        await conn.execute(
            """
            UPDATE "Repository"
            SET
                analysis_status = 'FAILED',
                updated_at = $1
            WHERE id = $2
            """,
            now,
            repository_id,
        )