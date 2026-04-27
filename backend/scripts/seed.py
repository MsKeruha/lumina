import json
import sys
import os
import datetime
from datetime import UTC
import random
import argparse

# Add parent directory to path to import models and database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models

def seed_from_json(force=False):
    db = SessionLocal()
    
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "books.json")
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        books_data = json.load(f)

    if force:
        print("Force mode: refreshing books from JSON...")
        titles = [b["title"] for b in books_data]
        
        # Delete discussions linked to these books first to avoid foreign key issues
        books_to_delete = db.query(models.Book).filter(models.Book.title.in_(titles)).all()
        book_ids = [b.id for b in books_to_delete]
        
        if book_ids:
            # Delete comments in those discussions
            db.query(models.Comment).filter(models.Comment.discussion_id.in_(
                db.query(models.Discussion.id).filter(models.Discussion.book_id.in_(book_ids))
            )).delete(synchronize_session=False)
            
            db.query(models.Discussion).filter(models.Discussion.book_id.in_(book_ids)).delete(synchronize_session=False)
            db.query(models.Book).filter(models.Book.id.in_(book_ids)).delete(synchronize_session=False)
            db.commit()
            print(f"Removed {len(book_ids)} existing books (and their discussions/comments) to re-seed.")
    else:
        # Check if we already have books
        existing_books_count = db.query(models.Book).count()
        if existing_books_count > 0:
            print("Database already has data. Skipping seeding to prevent overwriting your changes.")
            print("Hint: Use --force to refresh books that are present in books.json")
            db.close()
            return

    print(f"Seeding {len(books_data)} books...")
    db_books = []
    for b in books_data:
        # Extra safety: check if book exists again
        existing = db.query(models.Book).filter(models.Book.title == b["title"]).first()
        if existing:
            continue
            
        book = models.Book(
            title=b["title"],
            author=b["author"],
            cover_url=b.get("cover_url") or "https://images.unsplash.com/photo-1543005139-059c1fb2a743?q=80&w=800",
            description=b["description"],
            rating=b["rating"],
            category=b["category"]
        )
        db_books.append(book)
        db.add(book)
    
    db.commit()
    for b in db_books:
        db.refresh(b)
    
    # Seed Users (Intelligently)
    users_demo = [
        ("admin", "admin@lumina.club", "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"),
        ("andrii_reads", "andrii@example.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=andrii"),
        ("maria_book", "maria@example.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=maria"),
        ("ivan_k", "ivan@example.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=ivan")
    ]
    
    from app.auth import get_password_hash
    
    db_users = []
    for username, email, avatar in users_demo:
        # Check if user already exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if not existing_user:
            user = models.User(
                username=username,
                email=email,
                hashed_password=get_password_hash("admin123"),
                avatar_url=avatar,
                is_admin=1 if username == "admin" else 0,
                bio=f"Привіт, я {username}! Люблю читати."
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            db_users.append(user)
        else:
            db_users.append(existing_user)

    # Seed Clubs (Check if they exist to avoid duplicates)
    clubs_data = [
        ("Клуб Опівнічних Читачів", "Клуб для тих, хто любить глибокі філософські дискусії."),
        ("Фантастичні Світи", "Обговорюємо найкращу наукову фантастику та фентезі.")
    ]
    
    db_clubs = []
    for name, desc in clubs_data:
        existing_club = db.query(models.Club).filter(models.Club.name == name).first()
        if not existing_club:
            club = models.Club(name=name, description=desc, creator_id=db_users[0].id)
            db.add(club)
            db.commit()
            db.refresh(club)
            db_clubs.append(club)
            
            # Add all users to new clubs
            for u in db_users:
                u.clubs.append(club)
        else:
            db_clubs.append(existing_club)
    
    db.commit()

    # Seed Discussions (Only if we added new books or if discussions don't exist)
    if len(db_books) > 0 and len(db_clubs) >= 2:
        for i, book in enumerate(db_books[:3]):
            club = db_clubs[i % 2]
            existing_disc = db.query(models.Discussion).filter(
                models.Discussion.book_id == book.id,
                models.Discussion.club_id == club.id
            ).first()
            
            if not existing_disc:
                disc = models.Discussion(
                    club_id=club.id,
                    book_id=book.id,
                    topic=f"Обговорення '{book.title}'",
                    scheduled_at=datetime.datetime.now(UTC)
                )
                db.add(disc)
                db.commit()
                db.refresh(disc)
                
                # Add a demo comment
                comment = models.Comment(
                    discussion_id=disc.id,
                    user_id=db_users[random.randint(1, len(db_users)-1)].id,
                    content="Цікава книга! Давайте обговоримо.",
                    created_at=datetime.datetime.now(UTC)
                )
                db.add(comment)

    db.commit()
    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database from JSON")
    parser.add_argument("--force", action="store_true", help="Delete and re-seed books matching JSON titles")
    args = parser.parse_args()
    
    seed_from_json(force=args.force)
