from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TO_DO
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    project_id: int


class Task(TaskBase):
    id: int
    project_id: int

    class Config:
        orm_mode = True
