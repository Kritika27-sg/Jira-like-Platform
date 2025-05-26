from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import Comment, CommentCreate
from app.dependencies import get_current_user, require_role

router = APIRouter()


@router.post("/", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # All roles can add comments except Guests (not defined)
    comment = Comment(
        content=comment_in.content,
        task_id=comment_in.task_id,
        user_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/task/{task_id}", response_model=List[Comment])
def list_comments_for_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comments = db.query(Comment).filter(Comment.task_id == task_id).all()
    return comments


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Only Admin or the comment owner can delete
    if current_user.role != "Admin" and comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
    return
