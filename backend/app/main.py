from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, books, clubs, users, admin, discussions
from .database import engine, Base

# Create tables if they don't exist (useful for simple setups, 
# though Alembic is preferred for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lumina Reading Club API",
    description="Backend API for the Lumina Reading Club platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(clubs.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(discussions.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Lumina Reading Club API",
        "docs": "/docs",
        "version": "1.0.0"
    }
