from pydantic import BaseModel
from datetime import datetime


class ActivityLogBase(BaseModel):
    action: str


class ActivityLogCreate(ActivityLogBase):
    task_id: int
    user_id: int


class ActivityLog(ActivityLogBase):
    id: int
    task_id: int
    user_id: int
    timestamp: datetime

    class Config:
        orm_mode = True
