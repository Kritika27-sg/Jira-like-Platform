from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

# IMPORTANT: For production, these should come from environment variables
# For example, from a config.py or settings.py file, loaded via Pydantic BaseSettings.
# NEVER hardcode secret keys in production.
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
        # --- DEBUGGING START ---
        print(f"\n--- DEBUG: get_current_user ---")
        print(f"DEBUG: Token received (first 50 chars): {token[:50]}...")
        # --- DEBUGGING END ---

        # Attempt to decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # --- DEBUGGING START ---
        print(f"DEBUG: Decoded JWT Payload: {payload}")
        # --- DEBUGGING END ---

        user_id: str = payload.get("sub")
        # Ensure the 'sub' claim (subject) is present in the token payload
        if user_id is None:
            print("DEBUG: 'sub' claim not found in JWT payload.") # Debugging
            raise credentials_exception

    except JWTError as e:
        # This block catches all JWT-related errors:
        # - Invalid signature (wrong SECRET_KEY)
        # - Expired token (exp claim)
        # - Invalid algorithms
        # - Malformed token
        print(f"DEBUG: JWT Error: {e}") # This will show the specific JWT error
        raise credentials_exception
    except Exception as e:
        # Catch any other unexpected errors during token processing
        print(f"DEBUG: Unexpected error in get_current_user: {e}")
        raise credentials_exception

    try:
        # Convert user_id to int
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            print(f"DEBUG: User with ID '{user_id}' not found in database.") # Debugging
            raise credentials_exception
    except ValueError:
        # Catches error if user_id cannot be converted to int (e.g., if 'sub' is not a number)
        print(f"DEBUG: User ID '{user_id}' from token is not a valid integer.")
        raise credentials_exception
    except Exception as e:
        print(f"DEBUG: Error querying user from DB: {e}")
        raise credentials_exception

    print(f"DEBUG: Successfully authenticated user: {user.full_name} (ID: {user.id}, Role: {user.role})\n") # Debugging
    return user

# Modified to accept a list of roles
def require_role(required_roles: list): # Changed from required_role: str to required_roles: list
    def role_checker(current_user: User = Depends(get_current_user)):
        # --- DEBUGGING START ---
        print(f"--- DEBUG: require_role ---")
        print(f"DEBUG: User role: {current_user.role}, Required roles: {required_roles}")
        # --- DEBUGGING END ---

        if current_user.role not in required_roles: # Check if current user's role is in the list of required roles
            print(f"DEBUG: Permission denied. User '{current_user.full_name}' with role '{current_user.role}' not in required roles: {required_roles}") # Debugging
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted",
            )
        print(f"DEBUG: Role check passed for user '{current_user.full_name}'.\n") # Debugging
        return current_user
    return role_checker