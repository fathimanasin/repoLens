import os
import asyncpg


async def create_pg_pool() -> asyncpg.Pool:
    """
    Creates a fresh pool bound to the current event loop.
    Use this inside Celery tasks (asyncio.run per task).
    Caller is responsible for closing via close_pg_pool().
    """
    return await asyncpg.create_pool(
        dsn=os.getenv("DATABASE_URL"),
        min_size=2,
        max_size=5,
    )


async def close_pg_pool(pool: asyncpg.Pool) -> None:
    await pool.close()


# Kept for FastAPI test endpoints only.
# DO NOT use inside Celery tasks.
async def get_pg_pool() -> asyncpg.Pool:
    return await create_pg_pool()