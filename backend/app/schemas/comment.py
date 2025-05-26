from pydantic import BaseModel
from typing import Optional


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    task_id: int


class Comment(CommentBase):
    id: int
    task_id: int
    user_id: int

    class Config:
        orm_mode = True
