

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker

load_dotenv()  # Load environment variables from .env file

database_url = os.getenv("DATABASE_URL")

if database_url is None:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_engine(database_url)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass






