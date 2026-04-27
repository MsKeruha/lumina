from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    rating: float = 0.0
    category: Optional[str] = None

class Book(BookBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_admin: int
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None

class ClubBase(BaseModel):
    name: str
    description: str

class Club(ClubBase):
    id: int
    creator_id: int
    members: List[User] = []
    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str

class Comment(CommentBase):
    id: int
    user_id: int
    created_at: datetime
    user: User
    class Config:
        from_attributes = True

class DiscussionBase(BaseModel):
    topic: str
    scheduled_at: datetime
    club_id: int
    book_id: int

class Discussion(DiscussionBase):
    id: int
    book: Book
    comments: List[Comment] = []
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
