import json
import sys
import os

# Add parent directory to path to import models and database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import models

def manual_covers():
    db = SessionLocal()
    books = db.query(models.Book).all()
    
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "books.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    print(f"--- Lumina Club Cover Manager ---")
    print(f"Found {len(books)} books. Enter image URL for each (press Enter to skip/keep current).")
    
    updated_json = []
    
    for book in books:
        print(f"\nBook: {book.title} ({book.author})")
        print(f"Current Cover: {book.cover_url}")
        new_url = input("New URL: ").strip()
        
        if new_url:
            book.cover_url = new_url
            db.commit()
            print("Updated in DB.")
        
        # Sync with JSON
        for jb in json_data:
            if jb["title"] == book.title:
                jb["cover_url"] = book.cover_url
                updated_json.append(jb)
                break
        else:
            # If not in JSON, add it
            updated_json.append({
                "title": book.title,
                "author": book.author,
                "category": book.category,
                "description": book.description,
                "rating": book.rating,
                "cover_url": book.cover_url
            })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(updated_json, f, ensure_ascii=False, indent=4)
        
    print("\nAll done! JSON and DB are synced.")
    db.close()

if __name__ == "__main__":
    manual_covers()
