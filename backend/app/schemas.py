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
    pages: Optional[int] = 300


class Book(BookBase):
    id: int
    class Config:
        from_attributes = True

class UserBookBase(BaseModel):
    book_id: int
    status: str = "reading" # "reading", "completed", "planned"
    current_page: Optional[int] = 0
    total_pages: Optional[int] = 300

class UserBookCreate(UserBookBase):
    pass

class UserBookProgressUpdate(BaseModel):
    current_page: int


class UserBook(UserBookBase):
    id: int
    user_id: int
    added_at: datetime
    book: Book

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

# --- Reading Challenges ---
class ReadingChallengeBase(BaseModel):
    year: int
    target_books: int = 12

class ReadingChallengeCreate(ReadingChallengeBase):
    pass

class ReadingChallenge(ReadingChallengeBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Achievements ---
class AchievementBase(BaseModel):
    title: str
    description: str
    icon_name: str = "Trophy"
    criterion_type: str # books_read, comments_posted, clubs_created, diary_added
    target_value: int = 1

class AchievementCreate(AchievementBase):
    pass

class Achievement(AchievementBase):
    id: int
    class Config:
        from_attributes = True

class UserAchievementOut(AchievementBase):
    id: int
    unlocked: bool = False
    progress: float = 0.0

# --- Polls and Voting ---
class PollVoteBase(BaseModel):
    option_id: int

class PollVote(PollVoteBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class PollOptionBase(BaseModel):
    book_id: int

class PollOption(PollOptionBase):
    id: int
    poll_id: int
    book: Book
    votes: List[PollVote] = []
    class Config:
        from_attributes = True

class PollOptionCreate(BaseModel):
    book_id: int

class PollCreate(BaseModel):
    title: str
    book_ids: List[int]

class Poll(BaseModel):
    id: int
    club_id: int
    title: str
    is_active: int
    created_at: datetime
    options: List[PollOption] = []
    class Config:
        from_attributes = True

