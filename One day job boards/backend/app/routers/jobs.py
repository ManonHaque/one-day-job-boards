from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from .. import crud, models, schemas, auth, database

router = APIRouter()

@router.get("/", response_model=List[schemas.Job])
def read_jobs(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    jobs = crud.get_jobs(db, skip=skip, limit=limit, department=department, status=status)
    return jobs

@router.post("/", response_model=schemas.Job)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("poster"))
):
    return crud.create_job(db=db, job=job, user_id=str(current_user.id))

@router.get("/my-jobs", response_model=List[schemas.Job])
def get_my_jobs(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Get all jobs posted by the current user"""
    query = db.query(models.Job).filter(models.Job.posted_by == current_user.id)
    if status:
        query = query.filter(models.Job.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{job_id}", response_model=schemas.Job)
def read_job(job_id: str, db: Session = Depends(database.get_db)):
    db_job = crud.get_job_by_id(db, job_id=job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

@router.put("/{job_id}", response_model=schemas.Job)
def update_job(
    job_id: str,
    job_update: Dict[str, Any],
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_job = crud.get_job_by_id(db, job_id=job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(db_job.posted_by) != str(current_user.id) and str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    
    # Update only provided fields
    for key, value in job_update.items():
        if hasattr(db_job, key):
            setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_job = crud.get_job_by_id(db, job_id=job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(db_job.posted_by) != str(current_user.id) and str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    crud.delete_job(db=db, job_id=job_id)
    return {"message": "Job deleted successfully"}