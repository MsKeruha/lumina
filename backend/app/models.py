from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Table
from sqlalchemy.orm import relationship
from .database import Base
import datetime

# Junction table for Club Members
club_members = Table(
    "club_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("club_id", Integer, ForeignKey("clubs.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    is_admin = Column(Integer, default=0) # 0 = user, 1 = admin

    clubs = relationship("Club", secondary=club_members, back_populates="members")
    comments = relationship("Comment", back_populates="user")
    diary = relationship("UserBook", back_populates="user", cascade="all, delete-orphan")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    isbn = Column(String, unique=True, nullable=True)
    cover_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    category = Column(String, nullable=True)
    pages = Column(Integer, default=300) # Added for tracking calculations

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"))

    members = relationship("User", secondary=club_members, back_populates="clubs")
    discussions = relationship("Discussion", back_populates="club")
    polls = relationship("Poll", back_populates="club", cascade="all, delete-orphan")

class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    topic = Column(String)
    scheduled_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    club = relationship("Club", back_populates="discussions")
    book = relationship("Book")
    comments = relationship("Comment", back_populates="discussion")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    discussion = relationship("Discussion", back_populates="comments")
    user = relationship("User", back_populates="comments")

class UserBook(Base):
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    book_id = Column(Integer, ForeignKey("books.id"), index=True)
    status = Column(String, default="reading") # "reading", "completed", "planned"
    added_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    current_page = Column(Integer, default=0) # Added page tracking
    total_pages = Column(Integer, default=300) # Total capacity

    user = relationship("User", back_populates="diary")
    book = relationship("Book")

class ReadingChallenge(Base):
    __tablename__ = "reading_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    year = Column(Integer, index=True)
    target_books = Column(Integer, default=12)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User")

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), index=True)
    title = Column(String)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    club = relationship("Club", back_populates="polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")

class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), index=True)
    book_id = Column(Integer, ForeignKey("books.id"))

    poll = relationship("Poll", back_populates="options")
    book = relationship("Book")
    votes = relationship("PollVote", back_populates="option", cascade="all, delete-orphan")

class PollVote(Base):
    __tablename__ = "poll_votes"

    id = Column(Integer, primary_key=True, index=True)
    option_id = Column(Integer, ForeignKey("poll_options.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    option = relationship("PollOption", back_populates="votes")
    user = relationship("User")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    icon_name = Column(String, default="Trophy")
    criterion_type = Column(String) # e.g. "books_read", "comments_posted", "clubs_created", "diary_added"
    target_value = Column(Integer, default=1)


