from fastapi import FastAPI

from db.neo4j_client import close_neo4j_driver, get_neo4j_driver
from db.postgres import close_pg_pool, get_pg_pool

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
