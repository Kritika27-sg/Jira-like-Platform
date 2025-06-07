from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User as UserModel  # SQLAlchemy model
from app.schemas.user import User as UserSchema, UserCreate  # Pydantic schemas
from app.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def get_users(
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(require_role(["Project Manager"])),
):
    users = db.query(UserModel).all()
    return users

@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(require_role(["Admin"])),
):
    existing_user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = UserModel(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True,
        google_id=user_in.google_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{user_id}", response_model=UserSchema)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(require_role(["Project Manager"])),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(require_role(["Admin"])),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.email = user_in.email
    user.full_name = user_in.full_name
    user.role = user_in.role
    user.google_id = user_in.google_id
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(require_role(["Admin"])),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return