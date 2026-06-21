import json
import os

import redis.asyncio as aioredis


_redis_client = None


async def get_redis_client():
    global _redis_client

    if _redis_client is None:
        _redis_client = aioredis.from_url(
            os.getenv(
                "REDIS_URL",
                "redis://redis:6379",
            )
        )

    return _redis_client


async def publish_progress(
    repository_id: str,
    stage: str,
    percent: int,
    message: str = "",
) -> None:
    client = await get_redis_client()

    channel = (
        f"analysis:progress:{repository_id}"
    )

    payload = json.dumps(
        {
            "repositoryId": repository_id,
            "stage": stage,
            "percent": percent,
            "message": message,
        }
    )

    await client.publish(
        channel,
        payload,
    )