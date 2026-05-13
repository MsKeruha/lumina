import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models

db = SessionLocal()

print("=== USERS IN DB ===")
users = db.query(models.User).all()
for u in users:
    print(f"User ID={u.id}, Username={u.username}")

print("\n=== CLUBS IN DB ===")
clubs = db.query(models.Club).all()
for c in clubs:
    member_names = [u.username for u in c.members]
    print(f"Club ID={c.id}, Name={c.name}, OwnerID={c.creator_id}, Members={member_names}")

db.close()
