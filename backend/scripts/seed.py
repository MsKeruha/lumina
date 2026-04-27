import json
import sys
import os
import datetime
from datetime import UTC
import random

# Add parent directory to path to import models and database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app import models

def seed_from_json():
    db = SessionLocal()
    
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "books.json")
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        books_data = json.load(f)

    # Check if we already have books
    existing_books_count = db.query(models.Book).count()
    if existing_books_count > 0:
        print("Database already has data. Skipping seeding to prevent overwriting your changes.")
        db.close()
        return

    print(f"Seeding {len(books_data)} books...")
    db_books = []
    for b in books_data:
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
                hashed_password=get_password_hash("admin123"), # Set standard password for all seeded users
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

    # Seed Clubs
    clubs_data = [
        ("Клуб Опівнічних Читачів", "Клуб для тих, хто любить глибокі філософські дискусії."),
        ("Фантастичні Світи", "Обговорюємо найкращу наукову фантастику та фентезі.")
    ]
    
    db_clubs = []
    for name, desc in clubs_data:
        club = models.Club(name=name, description=desc, creator_id=db_users[0].id)
        db_clubs.append(club)
        db.add(club)
    
    db.commit()
    for c in db_clubs:
        db.refresh(c)
        # Add all users to clubs
        for u in db_users:
            u.clubs.append(c)
    db.commit()

    # Seed Discussions
    if len(db_books) >= 3 and len(db_clubs) >= 2:
        # Discussion 1
        disc1 = models.Discussion(
            club_id=db_clubs[0].id,
            book_id=db_books[0].id,
            topic=f"Обговорення '{db_books[0].title}'",
            scheduled_at=datetime.datetime.now(UTC)
        )
        db.add(disc1)
        db.commit()
        db.refresh(disc1)
        
        # Add comments to Discussion 1
        comments_list1 = [
            (db_users[1].id, "Це найкраща книга, яку я читав цього року!", 5),
            (db_users[2].id, "Погоджуюсь, сюжет просто захоплює.", 25)
        ]
        for uid, content, minutes_ago in comments_list1:
            comment = models.Comment(
                discussion_id=disc1.id,
                user_id=uid,
                content=content,
                created_at=datetime.datetime.now(UTC) - datetime.timedelta(minutes=minutes_ago)
            )
            db.add(comment)
            
        # Discussion 2
        disc2 = models.Discussion(
            club_id=db_clubs[1].id,
            book_id=db_books[1].id,
            topic=f"Чому '{db_books[1].title}' актуальна сьогодні?",
            scheduled_at=datetime.datetime.now(UTC)
        )
        db.add(disc2)
        db.commit()
        db.refresh(disc2)
        
        db.add(models.Comment(
            discussion_id=disc2.id,
            user_id=db_users[2].id,
            content="Світ Орвелла стає все більш реальним...",
            created_at=datetime.datetime.now(UTC) - datetime.timedelta(minutes=45)
        ))

        # Discussion 3
        disc3 = models.Discussion(
            club_id=db_clubs[0].id,
            book_id=db_books[2].id,
            topic=f"Персонажі у '{db_books[2].title}'",
            scheduled_at=datetime.datetime.now(UTC)
        )
        db.add(disc3)
        db.commit()
        db.refresh(disc3)

        db.add(models.Comment(
            discussion_id=disc3.id,
            user_id=db_users[3].id,
            content="Головний герой дуже суперечливий.",
            created_at=datetime.datetime.now(UTC) - datetime.timedelta(hours=2)
        ))

    db.commit()
    print("Seeding complete with real activity data!")
    db.close()

if __name__ == "__main__":
    seed_from_json()
