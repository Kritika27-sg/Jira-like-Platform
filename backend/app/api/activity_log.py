from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLog as ActivityLogSchema
from app.dependencies import get_current_user

router = APIRouter()
    
@router.get("/tasks/{task_id}", response_model=List[ActivityLogSchema])
def get_activity_logs_for_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    logs = db.query(ActivityLog).filter(ActivityLog.task_id == task_id).order_by(ActivityLog.timestamp.desc()).all()
    return logs
