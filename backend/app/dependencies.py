from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

SECRET_KEY = "your_jwt_secret_key" # Make sure this matches the key used to SIGN the token
ALGORITHM = "HS256"

# This specifies the URL where the frontend can request a token 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception
    except Exception as e:
        # Catch any other unexpected errors during token processing
        raise credentials_exception

    try:
        # Convert user_id to int
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
    except ValueError:
        raise credentials_exception
    except Exception as e:
        raise credentials_exception

    return user

def require_role(required_roles: list): 
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles: # Check if current user's role is in the list of required roles
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted",
            )
        return current_user
    return role_checker