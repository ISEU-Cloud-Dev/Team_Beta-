import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    "smart_inventory",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="America/Bogota",
    enable_utc=True,
    beat_schedule={
        "check-low-stock-every-minute": {
            "task": "app.tasks.check_stock_alerts",
            "schedule": crontab(minute="*"),
        }
    },
)

celery_app.autodiscover_tasks(["app"])
