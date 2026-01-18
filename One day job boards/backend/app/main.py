from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, jobs, case_studies, reviews, applications, admin, chat
from dotenv import load_dotenv

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Load environment variables from .env (if present)
load_dotenv()

app = FastAPI(title="One-Day Job Board API", version="1.0.0", redirect_slashes=False)

# CORS middleware for frontend integration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(case_studies.router, prefix="/case-studies", tags=["Case Studies"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(admin.router, tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to One-Day Job Board API"}