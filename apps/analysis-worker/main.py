from fastapi import FastAPI

from db.neo4j_client import close_neo4j_driver, get_neo4j_driver
from db.postgres import close_pg_pool, get_pg_pool
from tasks.clone_stage import clone_or_update
from tasks.graph_stage import build_dependency_graph
from tasks.parse_stage import parse_repository
from tasks.metrics_stage import (
    calculate_architecture_score,
)
from tasks.store_stage import store_analysis_results

app = FastAPI(title="RepoLens Analysis Worker")

@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_pg_pool()
    close_neo4j_driver()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "analysis-worker"}


@app.get("/test/db")
async def test_db() -> dict[str, int]:
    pool = await get_pg_pool()

    async with pool.acquire() as conn:
        count = await conn.fetchval(
            'SELECT COUNT(*) FROM "Repository"'
        )

    return {"repository_count": count}

@app.get("/test/neo4j")
def test_neo4j() -> dict[str, int]:
    driver = get_neo4j_driver()

    with driver.session() as session:
        result = session.run("RETURN 1 AS n")

        return {
            "neo4j_response": result.single()["n"],
        }
    
@app.get("/test/clone")
def test_clone() -> dict:
    result = clone_or_update(
        "https://github.com/karpathy/micrograd",
        "test-repo-py",
        "master",
    )

    return result


@app.get("/test/parse")
def test_parse() -> dict:
    modules = parse_repository("/tmp/repolens/test-repo-py")

    return {
        "total_modules": len(modules),
        "sample": modules[0].__dict__ if modules else None,
        "all_files": [m.file_path for m in modules],
    }

@app.get("/test/graph")
def test_graph() -> dict:
    driver = get_neo4j_driver()

    modules = parse_repository(
        "/tmp/repolens/test-repo-py"
    )

    circular = build_dependency_graph(
        modules,
        "test-repo-py",
        driver,
    )

    return {
        "nodes_created": len(modules),
        "circular_dependencies": circular,
    }

@app.get("/test/metrics")
def test_metrics() -> dict:
    driver = get_neo4j_driver()

    modules = parse_repository(
        "/tmp/repolens/test-repo-py"
    )

    circular = build_dependency_graph(
        modules,
        "test-repo-py",
        driver,
    )

    metrics = calculate_architecture_score(
        modules,
        circular,
    )

    return metrics


@app.post("/test/store")
async def test_store(
    repository_id: str,
) -> dict:
    pool = await get_pg_pool()

    modules = parse_repository(
        "/tmp/repolens/test-repo-py"
    )

    driver = get_neo4j_driver()

    circular = build_dependency_graph(
        modules,
        "test-repo-py",
        driver,
    )

    metrics = calculate_architecture_score(
        modules,
        circular,
    )

    snapshot = {
        "modules": [
            m.__dict__
            for m in modules
        ],
        "circularDependencies": circular,
    }

    result = await store_analysis_results(
        repository_id=repository_id,
        branch="master",
        commit_sha="test-sha-123",
        metrics=metrics,
        snapshot=snapshot,
        pool=pool,
    )

    return result
    



    



