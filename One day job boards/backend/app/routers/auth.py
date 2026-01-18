from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import crud, models, schemas, auth, database

router = APIRouter()

@router.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/promote/{username}", response_model=schemas.User)
def promote_user(
    username: str,
    update_data: schemas.UpdateUserRole,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("admin"))
):
    """
    Promote/update a user role to admin, poster, or doer.
    Only admins can use this endpoint.
    """
    # Find target user
    target_user = crud.get_user_by_username(db, username=update_data.username)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update role
    target_user.role = update_data.role
    db.commit()
    db.refresh(target_user)
    
    return target_user