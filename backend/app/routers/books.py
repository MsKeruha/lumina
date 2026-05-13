from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("", response_model=List[schemas.Book])
def get_books(q: Optional[str] = None, cat: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Book)
    if q:
        query = query.filter(
            (models.Book.title.ilike(f"%{q}%")) | 
            (models.Book.author.ilike(f"%{q}%"))
        )
    if cat:
        query = query.filter(models.Book.category == cat)
    return query.limit(20).all()

@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(database.get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.get("/{book_id}/discussions", response_model=List[schemas.Discussion])
def get_book_discussions(book_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Discussion).filter(models.Discussion.book_id == book_id).all()

@router.get("/{book_id}/recommendations", response_model=List[schemas.Book])
def get_book_recommendations(book_id: int, db: Session = Depends(database.get_db)):
    # Get current book to know category
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Fetch top rated books in same category, excluding current book
    recommendations = db.query(models.Book).filter(
        models.Book.category == book.category,
        models.Book.id != book_id
    ).order_by(models.Book.rating.desc()).limit(4).all()
    
    # Fallback if there are no books in the same category: show overall top rated books excluding current
    if not recommendations:
        recommendations = db.query(models.Book).filter(
            models.Book.id != book_id
        ).order_by(models.Book.rating.desc()).limit(4).all()
        
    return recommendations

