from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # Nullable for Google OAuth users
    is_active = Column(Boolean, default=True)
    role = Column(String, nullable=False)  # 'Admin', 'Project Manager', 'Developer', 'Client'
    google_id = Column(String, unique=True, nullable=True)  # For Google OAuth identification

def __repr__(self):
        return f"<User(email='{self.email}', full_name='{self.full_name}', role='{self.role}')>"