#!/usr/bin/env python3
"""Test database connection and verify tables exist."""
import sys
from sqlalchemy import create_engine, inspect, text
from core.config import get_settings

settings = get_settings()

print("=" * 60)
print("Testing Database Connection")
print("=" * 60)

try:
    # Test connection
    print(f"\n[1/3] Connecting to database...")
    print(f"  URL: postgresql://{settings.POSTGRES_USER}:***@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}")

    engine = create_engine(settings.database_url)

    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✓ Connected successfully!")
        print(f"  PostgreSQL version: {version.split(',')[0]}")

        # Check if tables exist
        print(f"\n[2/3] Checking tables...")
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        required_tables = ['voice_matrix', 'voice_analysis']

        if not tables:
            print(f"✗ No tables found in database '{settings.POSTGRES_DB}'")
            print(f"\nYou need to create the tables:")
            print(f"  psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/01-init-tables.sql")
            print(f"  psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/02-seed-fusion-matrix.sql")
            sys.exit(1)

        print(f"✓ Found {len(tables)} table(s): {', '.join(tables)}")

        # Check required tables
        missing = [t for t in required_tables if t not in tables]
        if missing:
            print(f"✗ Missing required tables: {', '.join(missing)}")
            sys.exit(1)
        else:
            print(f"✓ All required tables exist!")

        # Check fusion matrix has data
        print(f"\n[3/3] Checking fusion matrix data...")
        result = conn.execute(text("SELECT COUNT(*) FROM voice_matrix;"))
        count = result.fetchone()[0]

        if count == 0:
            print(f"✗ voice_matrix table is empty")
            print(f"\nYou need to seed the fusion matrix:")
            print(f"  psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/02-seed-fusion-matrix.sql")
            sys.exit(1)
        else:
            print(f"✓ Fusion matrix has {count} entries")

    print("\n" + "=" * 60)
    print("All checks passed! ✓")
    print("=" * 60)
    print("\nYou can now start the backend server:")
    print("  cd backend")
    print("  source ~/hfenv/bin/activate")
    print("  uvicorn app:app --reload --host 0.0.0.0 --port 8000")
    print("=" * 60)

except Exception as e:
    print(f"\n✗ Database error: {str(e)}")
    print("\nPossible solutions:")
    print("1. Make sure PostgreSQL is running:")
    print("   sudo systemctl start postgresql")
    print("2. Make sure the database exists:")
    print("   createdb -h localhost -p 5436 -U postgres mito_books")
    print("3. Make sure the password in .env is correct (currently: 123)")
    sys.exit(1)
