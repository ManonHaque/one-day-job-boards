from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, models, schemas, auth, database

router = APIRouter()

@router.get("/", response_model=List[schemas.Review])
def read_reviews(
    skip: int = 0,
    limit: int = 100,
    job_id: Optional[str] = Query(None),
    db: Session = Depends(database.get_db)
):
    reviews = crud.get_reviews(db, skip=skip, limit=limit, job_id=job_id)
    return reviews

@router.post("/", response_model=schemas.Review)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return crud.create_review(db=db, review=review, user_id=current_user.id)