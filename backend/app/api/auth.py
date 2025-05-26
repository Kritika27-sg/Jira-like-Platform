from fastapi import APIRouter, HTTPException, status, Query, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.dependencies import get_db

router = APIRouter()

GOOGLE_CLIENT_ID = "1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"
SECRET_KEY = "your_jwt_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.get('/google/callback')
async def google_callback(token: str = Query(...), db: Session = Depends(get_db)):
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
            user = User(email=email, full_name=full_name, role="Client", google_id=google_id)
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

