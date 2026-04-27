from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.post("/books", response_model=schemas.Book)
def add_book(book_in: schemas.BookBase, admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    new_book = models.Book(**book_in.model_dump())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.get("/stats")
def get_stats(admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    return {
        "users_count": db.query(models.User).count(),
        "books_count": db.query(models.Book).count(),
        "clubs_count": db.query(models.Club).count()
    }
