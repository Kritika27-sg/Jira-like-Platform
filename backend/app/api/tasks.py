from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.task import Task as TaskModel, TaskStatus
from app.models.user import User
from app.schemas.task import Task as TaskSchema, TaskCreate
from app.dependencies import get_current_user, require_role

router = APIRouter()


@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Project Manager"])),
):
    # Project Managers can only create tasks within their own projects, and assign to Developers
    if current_user.role == "Project Manager":
        # Check that current_user owns the project
        from app.models.project import Project
        project = db.query(Project).filter(Project.id == task_in.project_id).first()
        if not project or project.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Project Manager can create tasks only in projects they own")

        # Check assignee role if assigned
        if task_in.assignee_id:
            assignee = db.query(User).filter(User.id == task_in.assignee_id).first()
            if not assignee or assignee.role != "Developer":
                raise HTTPException(status_code=400, detail="Tasks can be assigned only to Developers")

    # Admin can create tasks anywhere
    task = TaskModel(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        project_id=task_in.project_id,
        assignee_id=task_in.assignee_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=List[TaskSchema])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "Admin":
        tasks = db.query(TaskModel).all()
    elif current_user.role == "Project Manager":
        # Tasks for projects owned by PM
        from app.models.project import Project
        projects = db.query(Project.id).filter(Project.owner_id == current_user.id).subquery()
        tasks = db.query(TaskModel).filter(TaskModel.project_id.in_(projects)).all()
    elif current_user.role == "Developer":
        tasks = db.query(TaskModel).filter(TaskModel.assignee_id == current_user.id).all()
    elif current_user.role == "Client":
        # Clients can see tasks in projects they are clients of (simplify to all projects for now)
        tasks = db.query(TaskModel).all()
    else:
        tasks = []
    return tasks


@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Access control
    if current_user.role == "Admin":
        return task
    if current_user.role == "Project Manager":
        if task.project.owner_id == current_user.id:
            return task
    if current_user.role == "Developer":
        if task.assignee_id == current_user.id:
            return task
    if current_user.role == "Client":
        return task

    raise HTTPException(status_code=403, detail="Permission denied")


@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Role-based update rights
    if current_user.role == "Admin":
        pass
    elif current_user.role == "Project Manager":
        if task.project.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed to update tasks outside your projects")
    elif current_user.role == "Developer":
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only update assigned tasks")
        # Developers can only update status and description? For simplicity, allow title update too

    else:
        raise HTTPException(status_code=403, detail="Permission denied")

    task.title = task_in.title
    task.description = task_in.description
    task.status = task_in.status

    # Check assignee change if allowed
    if current_user.role in ["Admin", "Project Manager"]:
        if task_in.assignee_id:
            assignee = db.query(User).filter(User.id == task_in.assignee_id).first()
            if not assignee or assignee.role != "Developer":
                raise HTTPException(status_code=400, detail="Tasks can be assigned only to Developers")
            task.assignee_id = task_in.assignee_id

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Project Manager"])),
):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == "Project Manager" and task.project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only delete tasks in your own projects")

    db.delete(task)
    db.commit()
    return