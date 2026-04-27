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

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"))

    members = relationship("User", secondary=club_members, back_populates="clubs")
    discussions = relationship("Discussion", back_populates="club")

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
