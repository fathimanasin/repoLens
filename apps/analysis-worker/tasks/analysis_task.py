import asyncio
import shutil

from worker import celery_app

from db.neo4j_client import get_neo4j_driver

from db.postgres import (
    create_pg_pool,
    close_pg_pool,
)

from progress import publish_progress

from tasks.clone_stage import clone_or_update
from tasks.graph_stage import build_dependency_graph
from tasks.metrics_stage import (
    calculate_architecture_score,
)
from tasks.parse_stage import parse_repository
from tasks.store_stage import (
    mark_analysis_failed,
    store_analysis_results,
)


@celery_app.task(name="run_analysis")
def run_analysis(
    repository_id: str,
    clone_url: str,
    branch: str,
) -> dict:
    return asyncio.run(
        _run_analysis_async(
            repository_id,
            clone_url,
            branch,
        )
    )


async def _run_analysis_async(
    repository_id: str,
    clone_url: str,
    branch: str,
) -> dict:

    pool = None

    try:
        pool = await create_pg_pool()

        await publish_progress(
            repository_id,
            "cloning",
            10,
            "Cloning repository...",
        )

        clone_result = clone_or_update(
            clone_url,
            repository_id,
            branch,
        )

        await publish_progress(
            repository_id,
            "parsing",
            35,
            "Parsing source files...",
        )

        modules = parse_repository(
            clone_result["clone_dir"]
        )

        await publish_progress(
            repository_id,
            "graphing",
            60,
            "Building dependency graph...",
        )

        driver = get_neo4j_driver()

        circular_deps = build_dependency_graph(
            modules,
            repository_id,
            driver,
        )

        await publish_progress(
            repository_id,
            "scoring",
            80,
            "Calculating metrics...",
        )

        metrics = calculate_architecture_score(
            modules,
            circular_deps,
        )

        await publish_progress(
            repository_id,
            "storing",
            90,
            "Saving results...",
        )

        snapshot = {
            "modules": [
                m.__dict__
                for m in modules
            ],
            "circularDependencies":
                circular_deps,
        }

        result = await store_analysis_results(
            repository_id=repository_id,
            branch=branch,
            commit_sha=clone_result["commit_sha"],
            metrics=metrics,
            snapshot=snapshot,
            pool=pool,
        )

        await publish_progress(
            repository_id,
            "complete",
            100,
            "Analysis complete",
        )

        shutil.rmtree(
            clone_result["clone_dir"],
            ignore_errors=True,
        )

        return {
            "status": "complete",
            "analysisId":
                result["analysis_id"],
            "driftEventId":
                result["drift_event_id"],
            "architectureScore":
                metrics["architecture_score"],
        }

    except Exception as e:
        error_message = str(e)

        if pool is not None:
            await mark_analysis_failed(
                repository_id,
                error_message,
                pool,
            )

        await publish_progress(
            repository_id,
            "failed",
            0,
            error_message,
        )

        shutil.rmtree(
            f"/tmp/repolens/{repository_id}",
            ignore_errors=True,
        )

        return {
            "status": "failed",
            "error": error_message,
        }

    finally:
        if pool is not None:
            await close_pg_pool(pool)