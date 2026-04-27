import sys
import os
import getpass

# Add parent directory to path to import models and database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

def create_superadmin():
    db = SessionLocal()
    
    print("--- Lumina Club SuperAdmin Creator ---")
    username = input("Enter admin username (default: admin): ").strip() or "admin"
    email = input("Enter admin email (default: admin@lumina.club): ").strip() or "admin@lumina.club"
    password = getpass.getpass("Enter admin password: ")
    
    if not password:
        print("Error: Password cannot be empty.")
        return

    # Check if user already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == username) | (models.User.email == email)
    ).first()
    
    if existing_user:
        print(f"User with this username or email already exists. Updating to Admin status...")
        existing_user.is_admin = 1
        existing_user.hashed_password = get_password_hash(password)
        db.commit()
        print(f"Successfully updated user '{username}' to SuperAdmin.")
    else:
        new_admin = models.User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            is_admin=1,
            bio="Головний адміністратор платформи Lumina Club."
        )
        db.add(new_admin)
        db.commit()
        print(f"Successfully created SuperAdmin '{username}'.")
    
    db.close()

if __name__ == "__main__":
    create_superadmin()
