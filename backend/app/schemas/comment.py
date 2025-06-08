from pydantic import BaseModel
from typing import Optional


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    project_id: int


class Comment(CommentBase):
    id: int
    project_id: int
    user_id: int

    class Config:
        orm_mode = True
