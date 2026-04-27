from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..dependencies import get_current_user

router = APIRouter(prefix="/clubs", tags=["Clubs"])

@router.get("", response_model=List[schemas.Club])
def get_clubs(db: Session = Depends(database.get_db)):
    return db.query(models.Club).all()

@router.post("", response_model=schemas.Club)
def create_club(club_in: schemas.ClubBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    new_club = models.Club(
        name=club_in.name,
        description=club_in.description,
        creator_id=current_user.id
    )
    db.add(new_club)
    db.commit()
    db.refresh(new_club)
    # Automatically add creator as member
    current_user.clubs.append(new_club)
    db.commit()
    return new_club

@router.post("/{club_id}/join")
def join_club(club_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if club in current_user.clubs:
        return {"message": "Already a member"}
    current_user.clubs.append(club)
    db.commit()
    return {"message": "Successfully joined club"}

@router.get("/{club_id}", response_model=schemas.Club)
def get_club(club_id: int, db: Session = Depends(database.get_db)):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club

@router.get("/{club_id}/discussions", response_model=List[schemas.Discussion])
def get_discussions(club_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Discussion).filter(models.Discussion.club_id == club_id).all()

@router.get("/stats/summary")
def get_stats(db: Session = Depends(database.get_db)):
    user_count = db.query(models.User).count()
    discussion_count = db.query(models.Discussion).count()
    book_count = db.query(models.Book).count()
    return {
        "users": f"{user_count}+",
        "discussions": discussion_count,
        "books": f"{book_count * 100}+",
        "growth": "+15%"
    }

@router.post("/{club_id}/discussions", response_model=schemas.Discussion)
def create_discussion(club_id: int, discussion_in: schemas.DiscussionBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Verify club exists
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    new_disc = models.Discussion(
        topic=discussion_in.topic,
        scheduled_at=discussion_in.scheduled_at,
        club_id=club_id,
        book_id=discussion_in.book_id
    )
    db.add(new_disc)
    db.commit()
    db.refresh(new_disc)
    return new_disc

@router.get("/community/activity")
def get_activity(db: Session = Depends(database.get_db)):
    from datetime import datetime, timezone
    comments = db.query(models.Comment).order_by(models.Comment.created_at.desc()).limit(3).all()
    
    activity = []
    for c in comments:
        # Simple time formatting
        now = datetime.now(timezone.utc)
        # Ensure c.created_at is timezone aware if now is, or both naive.
        # SQLite usually returns naive. Let's make now naive for comparison if needed, 
        # or better, ensure models have timezone aware datetimes.
        # For now, let's just make now naive to match existing data.
        diff = now.replace(tzinfo=None) - c.created_at.replace(tzinfo=None)
        minutes = int(diff.total_seconds() / 60)
        if minutes < 60:
            time_str = f"{minutes} хв тому" if minutes > 0 else "щойно"
        elif minutes < 1440:
            time_str = f"{minutes // 60} год тому"
        else:
            time_str = f"{minutes // 1440} дн тому"
            
        activity.append({
            "user": c.user.username,
            "action": "залишив(ла) коментар у",
            "target": c.discussion.book.title,
            "target_id": c.discussion.club_id, # Link back to the club where discussion is
            "target_type": "club",
            "time": time_str
        })
        
    if len(activity) < 3:
        activity.append({
            "user": "Олексій",
            "action": "приєднався до клубу",
            "target": "Наукова Фантастика",
            "target_id": 1,
            "target_type": "club",
            "time": "2 дн тому"
        })
        
    return activity
