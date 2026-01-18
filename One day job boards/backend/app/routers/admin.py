from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from .. import models, schemas, auth, database

router = APIRouter(prefix="/admin", tags=["admin"])

# User Management Endpoints
@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    skip: int = Query(0),
    limit: int = Query(100),
    role: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Get all users with optional role filter"""
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    return query.offset(skip).limit(limit).all()

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Delete a user account"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if str(user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}

@router.put("/users/{username}/role", response_model=schemas.User)
def update_user_role(
    username: str,
    role_data: Dict[str, str],
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Update a user's role"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_role = role_data.get("role")
    if new_role not in ["poster", "doer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    setattr(user, 'role', new_role)
    db.commit()
    db.refresh(user)
    return user

# Job Management Endpoints
@router.get("/jobs", response_model=List[schemas.Job])
def get_all_jobs(
    skip: int = Query(0),
    limit: int = Query(100),
    status: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Get all jobs with optional status filter"""
    query = db.query(models.Job)
    if status:
        query = query.filter(models.Job.status == status)
    return query.offset(skip).limit(limit).all()

@router.delete("/jobs/{job_id}")
def delete_job_admin(
    job_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """Delete a job post (admin only)"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.put("/jobs/{job_id}/status")
def update_job_status_admin(
    job_id: str,
    status_data: Dict[str, str],
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
) -> Dict[str, Any]:
    """Update job status (admin only)"""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    new_status = status_data.get("status")
    if new_status not in ["open", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    setattr(job, 'status', new_status)
    db.commit()
    db.refresh(job)
    return {"message": "Job status updated", "job": job}
