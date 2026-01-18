from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Literal
from uuid import UUID
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Literal['poster', 'doer', 'admin']  # Restricted allowed values
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Job schemas
class JobBase(BaseModel):
    title: str
    description: str
    reward: float
    reward_type: str  # 'credits', 'cash'
    department: Optional[str] = None
    estimated_time: Optional[str] = None
    skills_required: Optional[List[str]] = None
    is_featured: Optional[bool] = False
    image_url: Optional[str] = None

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: UUID
    slug: str
    posted_by: UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Case Study schemas
class CaseStudyBase(BaseModel):
    title: str
    category: str
    problem: str
    solution: str
    time_to_deliver: int
    difficulty_level: str  # 'easy', 'medium', 'hard'
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class CaseStudyCreate(CaseStudyBase):
    pass

class CaseStudy(CaseStudyBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Review schemas
class ReviewBase(BaseModel):
    rating: int  # 1-5
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    job_id: Optional[UUID] = None

class Review(ReviewBase):
    id: UUID
    user_id: UUID
    job_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Application schemas
class ApplicationBase(BaseModel):
    submitted_work: Optional[str] = None

class ApplicationCreate(BaseModel):
    job_id: UUID

class Application(ApplicationBase):
    id: UUID
    job_id: UUID
    applicant_id: UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UpdateUserRole(BaseModel):
    username: str
    role: Literal['poster', 'doer', 'admin']