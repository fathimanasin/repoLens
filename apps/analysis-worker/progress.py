import json
import os

import redis.asyncio as aioredis


async def publish_progress(
    repository_id: str,
    stage: str,
    percent: int,
    message: str = "",
) -> None:
    client = aioredis.from_url(
        os.getenv("REDIS_URL", "redis://redis:6379")
    )
    try:
        channel = f"analysis:progress:{repository_id}"
        payload = json.dumps({
            "repositoryId": repository_id,
            "stage": stage,
            "percent": percent,
            "message": message,
        })
        await client.publish(channel, payload)
    finally:
        await client.aclose()