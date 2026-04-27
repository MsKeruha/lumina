from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..dependencies import get_current_user

router = APIRouter(prefix="/discussions", tags=["Discussions"])

@router.get("/{discussion_id}/comments", response_model=List[schemas.Comment])
def get_comments(discussion_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Comment).filter(models.Comment.discussion_id == discussion_id).all()

@router.post("/{discussion_id}/comments", response_model=schemas.Comment)
def create_comment(discussion_id: int, comment_in: schemas.CommentBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Check if discussion exists
    discussion = db.query(models.Discussion).filter(models.Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
        
    new_comment = models.Comment(
        content=comment_in.content,
        discussion_id=discussion_id,
        user_id=current_user.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment
