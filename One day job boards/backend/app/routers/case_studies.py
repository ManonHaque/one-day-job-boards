from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, auth, database

router = APIRouter()

@router.get("/", response_model=List[schemas.CaseStudy])
def read_case_studies(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    case_studies = crud.get_case_studies(db, skip=skip, limit=limit)
    return case_studies

@router.post("/", response_model=schemas.CaseStudy)
def create_case_study(
    case_study: schemas.CaseStudyCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    return crud.create_case_study(db=db, case_study=case_study)

@router.get("/{case_study_id}", response_model=schemas.CaseStudy)
def read_case_study(case_study_id: str, db: Session = Depends(database.get_db)):
    db_case_study = crud.get_case_study_by_id(db, case_study_id=case_study_id)
    if db_case_study is None:
        raise HTTPException(status_code=404, detail="Case study not found")
    return db_case_study