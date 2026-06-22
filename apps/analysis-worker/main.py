from fastapi import FastAPI
from progress import publish_progress
from db.neo4j_client import close_neo4j_driver, get_neo4j_driver
from db.postgres import (
    create_pg_pool,
    close_pg_pool,
)
from tasks.clone_stage import clone_or_update
from tasks.graph_stage import build_dependency_graph
from tasks.parse_stage import parse_repository
from tasks.metrics_stage import (
    calculate_architecture_score,
)
from tasks.store_stage import store_analysis_results

from pydantic import BaseModel

from tasks.analysis_task import run_analysis

app = FastAPI(title="RepoLens Analysis Worker")

class AnalyzeRequest(BaseModel):
    repositoryId: str
    cloneUrl: str
    branch: str = "main"

@app.on_event("shutdown")
async def shutdown_event() -> None:
    close_neo4j_driver()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "analysis-worker"}

    

@app.post("/tasks/analyze")
def trigger_analysis(
    req: AnalyzeRequest,
) -> dict:
    task = run_analysis.delay(
        req.repositoryId,
        req.cloneUrl,
        req.branch,
    )

    return {
        "taskId": task.id,
        "status": "queued",
    }


@app.get("/tasks/{task_id}/status")
def get_task_status(
    task_id: str,
) -> dict:
    result = run_analysis.AsyncResult(
        task_id
    )

    return {
        "taskId": task_id,
        "status": result.status,
        "result":
            result.result
            if result.ready()
            else None,
    }




    



