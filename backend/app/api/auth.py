from fastapi import APIRouter, HTTPException, status, Query, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin # Assuming you'll create UserLogin schema
from app.dependencies import get_db

router = APIRouter()

GOOGLE_CLIENT_ID = "1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"
SECRET_KEY = "your_jwt_secret_key" # IMPORTANT: Use a strong, truly random secret key in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- New: User Registration Endpoint ---
@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with email and password.
    """
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists."
        )


    # Create new user in the database
    db_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        role=user_data.role # Ensure role is validated if needed
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token for the newly registered user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id), "role": db_user.role},
        expires_delta=access_token_expires
    )

    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role
        }
    }

# --- Optional: User Login Endpoint (if you also want traditional login) ---
@router.post("/login", response_model=dict)
async def login_for_access_token(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return access token.
    """
    user = db.query(User).filter(User.email == user_credentials.email).first()

    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.get('/google/callback')
async def google_callback(token: str = Query(...), db: Session = Depends(get_db)):
    # ... (your existing Google callback logic) ...
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo.get('email')
        full_name = idinfo.get('name')
        google_id = idinfo.get('sub')

        if not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token invalid - no email")

        # Check if user exists, create if not
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Default role is Client; Admins must be configured separately
            # IMPORTANT: For Google sign-up, you might not have a password, so `hashed_password` could be None or a default.
            # Make sure your User model handles nullable `hashed_password` or provides a suitable default for Google users.
            user = User(email=email, full_name=full_name, role=role, google_id=google_id) # Or a placeholder
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create JWT token for the user
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            }
        }

    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token")