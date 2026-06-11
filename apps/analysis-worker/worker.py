from celery import Celery

celery_app = Celery("repolens")
celery_app.config_from_object("celery_config")


@celery_app.task(name="ping_task")
def ping_task() -> str:
    return "pong"
