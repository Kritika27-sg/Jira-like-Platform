# Jira-Like Project Management Platform

A comprehensive project management platform built with FastAPI backend and React frontend, featuring role-based access control, Google OAuth authentication, and full CRUD operations for managing projects, tasks, and users.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Full CRUD operations for tasks with status tracking
- **User Management**: User registration, profile management, and role assignment
- **Activity Logging**: Track all changes made to tasks and projects
- **Real-time Updates**: Live updates for task status changes and comments

### Authentication & Authorization
- **Google OAuth Integration**: Secure authentication using Google accounts
- **Role-Based Access Control (RBAC)**: Four distinct user roles with specific permissions
- **JWT Token Management**: Secure API access with refresh token support

### User Roles & Permissions

#### 🟡 Project Manager
- Create and manage only projects they own
- Create tasks within their owned projects
- Assign tasks exclusively to Developers within their projects
- View project analytics and progress reports

#### 🟢 Developer
- View all tasks assigned to them across projects
- Update task status (To Do → In Progress → Done)
- Add comments and time logs to assigned tasks
- Upload attachments to tasks

#### 🔵 Client
- View progress of projects they have access to
- Comment on tasks within accessible projects
- Read-only access to project timelines and reports
- Cannot modify any project or task data

## 🛠 Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type annotations
- **Python-Jose**: JWT token handling
- **Authlib**: OAuth implementation

### Frontend
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe JavaScript development
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### Authentication
- **Google OAuth 2.0**: Third-party authentication
- **JWT**: JSON Web Tokens for session management

## 📋 Task Status Flow

```
To Do → In Progress → Done
```

- **To Do**: Newly created tasks awaiting work
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google OAuth 2.0 credentials

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira-platform/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables**
   Create `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/jira_db
   SECRET_KEY=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Database setup**
   ```bash
   alembic upgrade head
   ```

6. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

#### Users
- `GET /users/me` - Get current user profile
- `GET /users/` - List all users (Admin only)
- `PUT /users/{user_id}` - Update user profile
- `PUT /users/{user_id}/role` - Update user role (Admin only)

#### Projects
- `GET /projects/` - List projects (filtered by role)
- `POST /projects/` - Create new project
- `GET /projects/{project_id}` - Get project details
- `PUT /projects/{project_id}` - Update project
- `DELETE /projects/{project_id}` - Delete project

#### Tasks
- `GET /tasks/` - List tasks (filtered by role and assignment)
- `POST /tasks/` - Create new task
- `GET /tasks/{task_id}` - Get task details
- `PUT /tasks/{task_id}` - Update task
- `PUT /tasks/{task_id}/status` - Update task status
- `DELETE /tasks/{task_id}` - Delete task

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **OAuth 2.0**: Secure third-party authentication
- **SQL Injection Protection**: Parameterized queries via SQLAlchemy
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Pydantic models for request/response validation

## 📊 Database Schema

### Users Table
- id, email, name, role, google_id, created_at, updated_at

### Projects Table
- id, name, description, owner_id, created_at, updated_at

### Tasks Table
- id, title, description, status, project_id, assigned_to, created_by, created_at, updated_at

### Activity Logs Table
- id, entity_type, entity_id, action, user_id, details, timestamp

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm test
```
## 🚀 Deployment

### Backend Deployment (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment
```bash
npm run build
# Deploy build/ directory to your hosting service
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and is accessible

**Google OAuth Issues**
- Verify Google Client ID and Secret
- Check OAuth consent screen configuration
- Ensure redirect URIs are properly configured

**CORS Issues**
- Verify frontend URL is in CORS origins list
- Check that API calls include proper headers

**Permission Denied Errors**
- Verify user role assignments
- Check JWT token validity
- Ensure proper authentication headers

