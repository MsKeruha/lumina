#!/bin/bash

# Wait for database to be ready
echo "Waiting for postgres..."

python -c "
import psycopg2, time, os
while True:
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT')
        )
        conn.close()
        break
    except Exception as e:
        print(f'PostgreSQL is still starting up ({type(e).__name__}), waiting...')
        time.sleep(1)
"

echo "PostgreSQL is fully ready and accepting queries"

# Run migrations
echo "Running migrations..."
alembic upgrade head

# Run seeders
echo "Running seeders..."
python scripts/seed.py

# Start application
echo "Starting FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
