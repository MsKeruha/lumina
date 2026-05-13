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
            print("Database already has books. Skipping book insertion phase, but checking for new clubs and achievements...")

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
            category=b["category"],
            pages=random.randint(240, 680)  # Генерация реалистичного количества страниц
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
        ("Фантастичні Світи", "Обговорюємо найкращу наукову фантастику та фентезі."),
        ("Книжковий Детектив", "Любите загадки та розслідування? Вам сюди!"),
        ("Класика Назавжди", "Вивчаємо світову класичну літературу разом."),
        ("Сучасна Проза", "Обговорення бестселерів 21 століття."),
        ("Психологія & Розвиток", "Книги про мотивацію, психологію та саморозвиток.")
    ]
    
    db_clubs = []
    for name, desc in clubs_data:
        existing_club = db.query(models.Club).filter(models.Club.name == name).first()
        if not existing_club:
            # Assign random user as club owner
            random_owner = db_users[random.randint(0, len(db_users) - 1)]
            club = models.Club(name=name, description=desc, creator_id=random_owner.id)
            db.add(club)
            db.commit()
            db.refresh(club)
            db_clubs.append(club)
            
            # Randomly assign only 2-3 members from total users
            sampled = random.sample(db_users, k=min(len(db_users), random.randint(1, 3)))
            if random_owner not in sampled:
                sampled.append(random_owner)

            for u in sampled:
                if club not in u.clubs:
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

    # Seed Demo Reading Challenges
    current_year = datetime.datetime.now().year
    for user in db_users[:2]:
        existing_challenge = db.query(models.ReadingChallenge).filter(
            models.ReadingChallenge.user_id == user.id,
            models.ReadingChallenge.year == current_year
        ).first()
        if not existing_challenge:
            challenge = models.ReadingChallenge(
                user_id=user.id,
                year=current_year,
                target_books=random.choice([12, 24, 36])
            )
            db.add(challenge)

    # Seed Demo Poll in the primary club
    if len(db_clubs) > 0:
        active_club = db_clubs[0]
        existing_poll = db.query(models.Poll).filter(
            models.Poll.club_id == active_club.id,
            models.Poll.is_active == 1
        ).first()
        
        if not existing_poll:
            poll = models.Poll(
                club_id=active_club.id,
                title="Яку книгу читаємо наступного місяця?",
                is_active=1,
                created_at=datetime.datetime.now(UTC)
            )
            db.add(poll)
            db.commit()
            db.refresh(poll)
            
            # Select books for voting
            avail_books = db.query(models.Book).limit(5).all()
            if len(avail_books) >= 3:
                for b_cand in avail_books[1:4]: # 1984, Gatsby, Hobbit
                    opt = models.PollOption(
                        poll_id=poll.id,
                        book_id=b_cand.id
                    )
                    db.add(opt)
                db.commit()
                
                # Give random user votes
                db.refresh(poll)
                for u in db_users:
                    random_opt = random.choice(poll.options)
                    vote = models.PollVote(
                        option_id=random_opt.id,
                        user_id=u.id
                    )
                    db.add(vote)

    # Seed Achievements
    achievements_defaults = [
        {
            "title": "Перші кроки",
            "description": "Додати першу книгу у власний літературний щоденник",
            "icon_name": "BookOpen",
            "criterion_type": "diary_added",
            "target_value": 1
        },
        {
            "title": "Книжковий черв'як",
            "description": "Повністю прочитати 5 або більше книг",
            "icon_name": "Medal",
            "criterion_type": "books_read",
            "target_value": 5
        },
        {
            "title": "Душа компанії",
            "description": "Залишити 10 або більше коментарів в обговореннях",
            "icon_name": "MessageSquare",
            "criterion_type": "comments_posted",
            "target_value": 10
        },
        {
            "title": "Організатор",
            "description": "Створити власний книжковий клуб та очолити його",
            "icon_name": "Trophy",
            "criterion_type": "clubs_created",
            "target_value": 1
        },
        {
            "title": "Суперчитач",
            "description": "Прочитати 25 книг!",
            "icon_name": "Flame",
            "criterion_type": "books_read",
            "target_value": 25
        }
    ]

    for ach_data in achievements_defaults:
        exists = db.query(models.Achievement).filter(models.Achievement.title == ach_data["title"]).first()
        if not exists:
            ach = models.Achievement(**ach_data)
            db.add(ach)

    db.commit()
    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database from JSON")
    parser.add_argument("--force", action="store_true", help="Delete and re-seed books matching JSON titles")
    args = parser.parse_args()
    
    seed_from_json(force=args.force)
