from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth
from ..dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if user_update.username:
        current_user.username = user_update.username
    if user_update.bio:
        current_user.bio = user_update.bio
    if user_update.avatar_url:
        current_user.avatar_url = user_update.avatar_url
    if user_update.password:
        current_user.hashed_password = auth.get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/clubs", response_model=List[schemas.Club])
def read_users_clubs(current_user: models.User = Depends(get_current_user)):
    return current_user.clubs

@router.get("/me/diary", response_model=List[schemas.UserBook])
def get_diary(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.UserBook).filter(models.UserBook.user_id == current_user.id).all()

@router.post("/me/diary", response_model=schemas.UserBook)
def add_to_diary(diary_in: schemas.UserBookCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Verify book exists
    book = db.query(models.Book).filter(models.Book.id == diary_in.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    existing = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id,
        models.UserBook.book_id == diary_in.book_id
    ).first()
    
    if existing:
        existing.status = diary_in.status
        db.commit()
        db.refresh(existing)
        return existing
    
    new_entry = models.UserBook(
        user_id=current_user.id,
        book_id=diary_in.book_id,
        status=diary_in.status,
        current_page=0,
        total_pages=book.pages or 300
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.delete("/me/diary/{book_id}")
def remove_from_diary(book_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    entry = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id,
        models.UserBook.book_id == book_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found in diary")
        
    db.delete(entry)
    db.commit()
    return {"message": "Successfully removed from diary"}

@router.put("/me/diary/{user_book_id}/progress", response_model=schemas.UserBook)
def update_diary_progress(user_book_id: int, progress: schemas.UserBookProgressUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    entry = db.query(models.UserBook).filter(
        models.UserBook.id == user_book_id,
        models.UserBook.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
        
    entry.current_page = min(progress.current_page, entry.total_pages)
    
    # Automatically mark completed if pages match
    if entry.current_page >= entry.total_pages:
        entry.status = "completed"
        
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/me/challenge", response_model=Optional[schemas.ReadingChallenge])
def get_annual_challenge(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    import datetime
    curr_year = datetime.datetime.now().year
    return db.query(models.ReadingChallenge).filter(
        models.ReadingChallenge.user_id == current_user.id,
        models.ReadingChallenge.year == curr_year
    ).first()

@router.post("/me/challenge", response_model=schemas.ReadingChallenge)
def create_annual_challenge(challenge_in: schemas.ReadingChallengeCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    existing = db.query(models.ReadingChallenge).filter(
        models.ReadingChallenge.user_id == current_user.id,
        models.ReadingChallenge.year == challenge_in.year
    ).first()
    
    if existing:
        existing.target_books = challenge_in.target_books
        db.commit()
        db.refresh(existing)
        return existing
        
    new_chal = models.ReadingChallenge(
        user_id=current_user.id,
        year=challenge_in.year,
        target_books=challenge_in.target_books
    )
    db.add(new_chal)
    db.commit()
    db.refresh(new_chal)
    return new_chal

@router.get("/me/achievements", response_model=List[schemas.UserAchievementOut])
def get_user_achievements(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # 1. Базовые метрики
    completed_count = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id,
        models.UserBook.status == "completed"
    ).count()
    
    comments_count = db.query(models.Comment).filter(
        models.Comment.user_id == current_user.id
    ).count()
    
    clubs_created = db.query(models.Club).filter(
        models.Club.creator_id == current_user.id
    ).count()
    
    diary_total = len(current_user.diary)

    # 2. НОВЫЕ ДИНАМИЧЕСКИЕ МЕТРИКИ (для расширения возможностей)
    from sqlalchemy import func
    pages_read = db.query(func.sum(models.UserBook.current_page)).filter(
        models.UserBook.user_id == current_user.id
    ).scalar() or 0

    polls_voted = db.query(models.PollVote).filter(
        models.PollVote.user_id == current_user.id
    ).count()

    # Единый словарь переменных пользователя для формул достижений
    user_metrics = {
        "books_read": completed_count,
        "comments_posted": comments_count,
        "clubs_created": clubs_created,
        "diary_added": diary_total,
        "pages_read": int(pages_read),
        "polls_voted": polls_voted
    }

    # Загрузка динамических определений достижений из БД
    all_achievements = db.query(models.Achievement).order_by(models.Achievement.id.asc()).all()
    results = []

    import re
    for ach in all_achievements:
        val = 0
        criterion = ach.criterion_type or "books_read"

        # Способ А: Прямая метрика из словаря
        if criterion in user_metrics:
            val = user_metrics[criterion]
        else:
            # Способ Б: ГИБКИЙ ДВИЖОК ФОРМУЛ ДЛЯ КОДА!
            try:
                formula = str(criterion).lower()
                # Подставляем реальные значения в строку формулы
                for name, num in user_metrics.items():
                    formula = formula.replace(name, str(num))
                
                # Безопасная очистка логических слов Python logic
                clean_formula = formula.replace("and", "").replace("or", "").replace("not", "")
                
                # Безопасная фильтрация для eval: разрешаем цифры, математику, логические операторы и знаки равенства
                if re.sub(r'[\s\d\+\-\*\/\(\)\.\>\<=\!]', '', clean_formula) == '':
                    val = eval(formula, {"__builtins__": None}, {})
                else:
                    val = 0
            except Exception:
                val = 0

        target = max(ach.target_value, 1)
        
        # Если результатом формулы стало логическое условие (True/False), преобразуем его в прогресс
        if isinstance(val, bool):
            val = float(target) if val else 0.0

        progress = min((float(val) / float(target)) * 100.0, 100.0)
        
        results.append({
            "id": ach.id,
            "title": ach.title,
            "description": ach.description,
            "icon_name": ach.icon_name,
            "criterion_type": ach.criterion_type,
            "target_value": ach.target_value,
            "unlocked": float(val) >= float(target),
            "progress": progress
        })

    return results


@router.get("/{user_id}/profile")
def get_public_profile(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    # Розрахунок базових метрик для даного користувача
    completed_count = db.query(models.UserBook).filter(
        models.UserBook.user_id == user.id,
        models.UserBook.status == "completed"
    ).count()
    
    comments_count = db.query(models.Comment).filter(
        models.Comment.user_id == user.id
    ).count()
    
    clubs_created = db.query(models.Club).filter(
        models.Club.creator_id == user.id
    ).count()
    
    diary_total = len(user.diary)
    
    from sqlalchemy import func
    pages_read = db.query(func.sum(models.UserBook.current_page)).filter(
        models.UserBook.user_id == user.id
    ).scalar() or 0
    
    polls_voted = db.query(models.PollVote).filter(
        models.PollVote.user_id == user.id
    ).count()
    
    user_metrics = {
        "books_read": completed_count,
        "comments_posted": comments_count,
        "clubs_created": clubs_created,
        "diary_added": diary_total,
        "pages_read": int(pages_read),
        "polls_voted": polls_voted
    }
    
    # Розрахунок прогресу досягнень
    all_achievements = db.query(models.Achievement).order_by(models.Achievement.id.asc()).all()
    ach_results = []
    import re
    
    for ach in all_achievements:
        val = 0
        criterion = ach.criterion_type or "books_read"
        if criterion in user_metrics:
            val = user_metrics[criterion]
        else:
            try:
                formula = str(criterion).lower()
                for name, num in user_metrics.items():
                    formula = formula.replace(name, str(num))
                clean_formula = formula.replace("and", "").replace("or", "").replace("not", "")
                if re.sub(r'[\s\d\+\-\*\/\(\)\.\>\<=\!]', '', clean_formula) == '':
                    val = eval(formula, {"__builtins__": None}, {})
                else:
                    val = 0
            except Exception:
                val = 0
        
        target = max(ach.target_value, 1)
        if isinstance(val, bool):
            val = float(target) if val else 0.0
        progress = min((float(val) / float(target)) * 100.0, 100.0)
        
        ach_results.append({
            "id": ach.id,
            "title": ach.title,
            "description": ach.description,
            "icon_name": ach.icon_name,
            "criterion_type": ach.criterion_type,
            "target_value": ach.target_value,
            "unlocked": float(val) >= float(target),
            "progress": progress
        })

    # Отримання цілі читання (challenge)
    challenge = db.query(models.ReadingChallenge).filter(
        models.ReadingChallenge.user_id == user.id,
        models.ReadingChallenge.year == 2026
    ).first()
    
    # Формування списку щоденника з деталями книг
    diary_items = []
    for item in user.diary:
        diary_items.append({
            "book_id": item.book_id,
            "title": item.book.title,
            "author": item.book.author,
            "cover_url": item.book.cover_url,
            "status": item.status,
            "current_page": item.current_page,
            "total_pages": item.total_pages
        })

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "is_admin": user.is_admin
        },
        "stats": user_metrics,
        "achievements": ach_results,
        "challenge": challenge,
        "diary": diary_items
    }




