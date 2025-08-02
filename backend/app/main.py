from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import logging
from app.api import auth, users, projects, tasks, comments, activity_log

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app with Railway-optimized configuration
app = FastAPI(
    title="Jira Backend",
    description="Jira-like project management backend deployed on Railway",
    version="1.0.0"
)

# Get environment configuration for Railway
environment = os.getenv("RAILWAY_ENVIRONMENT", "development")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
railway_public_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN", "")

# Configure CORS for Railway deployment
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:5173",  # Vite dev server (if you use Vite)
    frontend_url,
]

# Add Railway domains if available
if railway_public_domain:
    allowed_origins.extend([
        f"https://{railway_public_domain}",
        f"http://{railway_public_domain}"
    ])

# If you know your frontend Railway domain, add it here
# allowed_origins.append("https://your-frontend-domain.railway.app")

logger.info(f"Environment: {environment}")
logger.info(f"Allowed CORS origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Railway health check endpoint (REQUIRED)
@app.get("/health")
async def health_check():
    """Health check endpoint for Railway monitoring"""
    return {
        "status": "healthy",
        "message": "Jira Backend API is running on Railway",
        "environment": environment,
        "version": "1.0.0"
    }

# Root endpoint with API information
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Jira Backend API is running on Railway!",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "users": "/users", 
            "projects": "/projects",
            "tasks": "/tasks",
            "comments": "/comments",
            "activity_log": "/activity-log"
        }
    }

# Include your existing routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(comments.router, prefix="/comments", tags=["comments"])
app.include_router(activity_log.router, prefix="/activity-log", tags=["activity_log"])

# Startup event for logging
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Jira Backend API started successfully!")
    logger.info(f"📊 Environment: {environment}")
    logger.info(f"🌐 CORS origins: {allowed_origins}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Jira Backend API shutting down...")

# Run the app (for local development)
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)