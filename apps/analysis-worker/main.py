from fastapi import FastAPI

from db.postgres import close_pg_pool, get_pg_pool

app = FastAPI(title="RepoLens Analysis Worker")

@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_pg_pool()


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
