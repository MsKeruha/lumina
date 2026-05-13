from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
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

@router.get("/books", response_model=List[schemas.Book])
def get_admin_books(
    admin: models.User = Depends(get_admin_user), 
    skip: int = 0, 
    limit: int = 10,
    db: Session = Depends(database.get_db)
):
    return db.query(models.Book).order_by(models.Book.id.desc()).offset(skip).limit(limit).all()

@router.delete("/books/{book_id}")
def delete_book(book_id: int, admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Delete from DB
    db.delete(book)
    db.commit()
    return {"message": "Book successfully deleted"}


# --- Club Moderation ---
@router.get("/clubs", response_model=List[schemas.Club])
def get_admin_clubs(admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    return db.query(models.Club).order_by(models.Club.id.desc()).all()

@router.delete("/clubs/{club_id}")
def delete_club(club_id: int, admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Standard delete cascade works in ORM usually
    db.delete(club)
    db.commit()
    return {"message": "Club successfully moderated (deleted)"}


# --- Achievements Management ---
@router.get("/achievements", response_model=List[schemas.Achievement])
def get_admin_achievements(admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    return db.query(models.Achievement).order_by(models.Achievement.id.asc()).all()

@router.post("/achievements", response_model=schemas.Achievement)
def add_achievement(ach_in: schemas.AchievementCreate, admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    criterion = ach_in.criterion_type
    standard_metrics = ["books_read", "comments_posted", "clubs_created", "diary_added", "pages_read", "polls_voted"]
    
    # Валідація кастомної код-формули
    if criterion not in standard_metrics:
        try:
            formula = str(criterion).strip()
            if not formula:
                raise ValueError("Формула не може бути порожньою")
                
            import re
            
            # 1. Фільтрація дозволених символів та слів
            clean = formula.lower()
            for var in standard_metrics:
                clean = clean.replace(var, "")
            
            # Видаляємо логічні оператори Python
            clean = clean.replace("and", "").replace("or", "").replace("not", "")
            
            # Перевіряємо, чи не залишилося заборонених символів або слів
            forbidden = re.sub(r'[\s\d\+\-\*\/\(\)\.\>\<=\!]', '', clean)
            if forbidden != "":
                raise HTTPException(
                    status_code=400, 
                    detail=f"Помилка: у формулі присутні заборонені символи або невідомі змінні ('{forbidden[:10]}')"
                )
            
            # 2. Пробний запуск (Dry Run) для перевірки синтаксису
            test_formula = formula.lower()
            for var in standard_metrics:
                test_formula = test_formula.replace(var, "1") # Підставляємо тестове число
            
            # Спроба обчислення в безпечній пісочниці
            result = eval(test_formula, {"__builtins__": None}, {})
            if not isinstance(result, (int, float, bool)):
                raise ValueError("Результат формули має бути числом або логічним значенням")
                
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Синтаксична помилка у вашій формулі. Перевірте дужки та оператори."
            )

    new_ach = models.Achievement(**ach_in.model_dump())
    db.add(new_ach)
    db.commit()
    db.refresh(new_ach)
    return new_ach

@router.delete("/achievements/{achievement_id}")
def delete_achievement(achievement_id: int, admin: models.User = Depends(get_admin_user), db: Session = Depends(database.get_db)):
    ach = db.query(models.Achievement).filter(models.Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    db.delete(ach)
    db.commit()
    return {"message": "Achievement deleted successfully"}
