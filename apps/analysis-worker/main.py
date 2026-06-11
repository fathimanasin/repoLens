from fastapi import FastAPI

app = FastAPI(title="RepoLens Analysis Worker")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "analysis-worker"}
