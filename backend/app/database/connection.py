import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Vercel functions may be created and recycled independently. Avoid keeping
# a process-local connection pool on Vercel; the database URL can point to
# the provider's pooled PostgreSQL endpoint for production.
engine_kwargs = {
    "pool_pre_ping": True,
}

if os.getenv("VERCEL"):
    engine_kwargs["poolclass"] = NullPool

engine = create_engine(
    DATABASE_URL,
    **engine_kwargs
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()