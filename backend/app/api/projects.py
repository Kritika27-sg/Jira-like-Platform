from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.project import Project
from app.schemas.project import Project as ProjectSchema, ProjectCreate
from app.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Project Manager"])),
):
    # Project Managers can create projects only for themselves as owner
    if current_user.role == "Project Manager":
        owner_id = current_user.id
    elif current_user.role == "Admin":
        # Admin can set any owner (for simplicity, assign to themselves)
        owner_id = current_user.id
    else:
        raise HTTPException(status_code=403, detail="Not allowed to create projects")
    
    project = Project(
        name=project_in.name, 
        description=project_in.description, 
        owner_id=owner_id
    )
    db.add(project)
    db.commit()
    db.refresh(project)  # This ensures the ID is populated
    
    return project

@router.get("/", response_model=List[ProjectSchema])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin sees all projects
    if current_user.role == "Admin":
        projects = db.query(Project).all()
    elif current_user.role == "Project Manager":
        projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    elif current_user.role in ["Developer", "Client"]:
        # Developers and Clients can see projects where they have tasks or are client
        projects = db.query(Project).all()
    else:
        projects = []
    
    return projects

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Access control
    if current_user.role == "Admin":
        return project
    if current_user.role == "Project Manager" and project.owner_id == current_user.id:
        return project
    # Developers and Clients can view projects
    if current_user.role in ["Developer", "Client"]:
        return project
    
    raise HTTPException(status_code=403, detail="Permission denied")

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Project Manager"])),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role == "Project Manager" and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Project Managers can only update their own projects")
    
    project.name = project_in.name
    project.description = project_in.description
    db.commit()
    db.refresh(project)
    
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Project Manager"])),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role == "Project Manager" and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Project Managers can only delete their own projects")
    
    db.delete(project)
    db.commit()
    return