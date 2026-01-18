from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from . import models, schemas, auth
from uuid import uuid4

# User CRUD
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(str(user.password))
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        department=user.department
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Job CRUD
def get_jobs(db: Session, skip: int = 0, limit: int = 100, department: Optional[str] = None, status: Optional[str] = None):
    query = db.query(models.Job)
    if department:
        query = query.filter(models.Job.department == department)
    if status:
        query = query.filter(models.Job.status == status)
    return query.offset(skip).limit(limit).all()

def get_job_by_id(db: Session, job_id: str):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

def get_job_by_slug(db: Session, slug: str):
    return db.query(models.Job).filter(models.Job.slug == slug).first()

def create_job(db: Session, job: schemas.JobCreate, user_id: str):
    slug = job.title.lower().replace(" ", "-") + "-" + str(uuid4())[:8]
    db_job = models.Job(
        **job.model_dump(),
        slug=slug,
        posted_by=user_id
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: str, job_update: schemas.JobCreate):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job:
        for key, value in job_update.model_dump().items():
            setattr(db_job, key, value)
        db.commit()
        db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: str):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if db_job:
        db.delete(db_job)
        db.commit()
    return db_job

# Case Study CRUD
def get_case_studies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CaseStudy).offset(skip).limit(limit).all()

def get_case_study_by_id(db: Session, case_study_id: str):
    return db.query(models.CaseStudy).filter(models.CaseStudy.id == case_study_id).first()

def create_case_study(db: Session, case_study: schemas.CaseStudyCreate):
    db_case_study = models.CaseStudy(**case_study.model_dump())
    db.add(db_case_study)
    db.commit()
    db.refresh(db_case_study)
    return db_case_study

# Review CRUD
def get_reviews(db: Session, skip: int = 0, limit: int = 100, job_id: Optional[str] = None):
    query = db.query(models.Review)
    if job_id:
        query = query.filter(models.Review.job_id == job_id)
    return query.offset(skip).limit(limit).all()

def create_review(db: Session, review: schemas.ReviewCreate, user_id: str):
    db_review = models.Review(**review.model_dump(), user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

# Application CRUD
def get_applications_for_job(db: Session, job_id: str):
    return db.query(models.Application).filter(models.Application.job_id == job_id).all()

def get_applications_for_user(db: Session, user_id: str):
    return db.query(models.Application).filter(models.Application.applicant_id == user_id).all()

def create_application(db: Session, application: schemas.ApplicationCreate, user_id: str):
    db_application = models.Application(**application.model_dump(), applicant_id=user_id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def update_application_status(db: Session, application_id: str, status: str):
    db_application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if db_application:
        setattr(db_application, 'status', status)
        db.commit()
        db.refresh(db_application)
    return db_application

def get_doer_earnings(db: Session, doer_id: str) -> Dict[str, Any]:
    """Get total credits and cash earned by a doer from completed applications"""
    completed_applications = db.query(
        models.Application,
        models.Job
    ).join(
        models.Job,
        models.Application.job_id == models.Job.id
    ).filter(
        models.Application.applicant_id == doer_id,
        models.Application.status == "completed"
    ).all()
    
    total_credits = 0.0
    total_cash = 0.0
    
    for _, job in completed_applications:
        if job.reward_type == "credits":
            total_credits += float(job.reward) if job.reward else 0
        elif job.reward_type == "cash":
            total_cash += float(job.reward) if job.reward else 0
    
    return {
        "total_credits": total_credits,
        "total_cash": total_cash,
        "total_completed_jobs": len(completed_applications)
    }