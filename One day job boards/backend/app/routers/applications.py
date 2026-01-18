from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .. import crud, models, schemas, auth, database

router = APIRouter()

@router.post("/", response_model=schemas.Application)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if job exists and is open
    job = crud.get_job_by_id(db, job_id=str(application.job_id))
    if job is None or str(job.status) != "open":
        raise HTTPException(status_code=400, detail="Job not available")
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.job_id == application.job_id,
        models.Application.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    return crud.create_application(db=db, application=application, user_id=str(current_user.id))

@router.get("/my", response_model=List[schemas.Application])
def get_my_applications(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return crud.get_applications_for_user(db, user_id=str(current_user.id))

@router.get("/job/{job_id}")
def get_applications_for_job(
    job_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
) -> List[Dict[str, Any]]:
    job = crud.get_job_by_id(db, job_id=job_id)
    if job is None or str(job.posted_by) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    applications = crud.get_applications_for_job(db, job_id=job_id)
    # Add applicant details to each application
    result: List[Dict[str, Any]] = []
    for app in applications:
        applicant = db.query(models.User).filter(models.User.id == app.applicant_id).first()
        app_dict: Dict[str, Any] = {
            "id": str(app.id),
            "job_id": str(app.job_id),
            "applicant_id": str(app.applicant_id),
            "status": app.status,
            "submitted_work": app.submitted_work,
            "created_at": app.created_at.isoformat(),
            "applicant": {
                "id": str(applicant.id),
                "username": applicant.username,
                "email": applicant.email,
                "department": applicant.department
            } if applicant else None
        }
        result.append(app_dict)
    return result

@router.put("/{application_id}/status", response_model=schemas.Application)
def update_application_status(
    application_id: str,
    update: Dict[str, str],
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # For simplicity, assume update = {"status": "accepted"}
    status = update.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status required")
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    job = crud.get_job_by_id(db, job_id=str(application.job_id))
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.posted_by) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.update_application_status(db, application_id=application_id, status=status)

@router.get("/earnings/my")
def get_my_earnings(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
) -> Dict[str, Any]:
    """Get total credits and cash earned by the current doer"""
    return crud.get_doer_earnings(db, doer_id=str(current_user.id))