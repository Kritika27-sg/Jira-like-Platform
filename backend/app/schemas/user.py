from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str


class UserCreate(UserBase):
    password: str # Password is required for registration


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    is_active: bool
    google_id: Optional[str] = None # Added for Google users
    class Config:
        orm_mode = True
