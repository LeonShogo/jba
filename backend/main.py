from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi import Depends

from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from models import ClubModel

app = FastAPI()

class Club(BaseModel):
    id: int
    name: str
    city: str
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None

class ClubCreate(BaseModel):
    name: str
    city: str
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None


class ClubUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/clubs", response_model=list[Club])
def get_clubs(db: Session = Depends(get_db)) -> list[Club]:
    return list(db.scalars(select(ClubModel)).all())

@app.get("/clubs/{club_id}", response_model=Club)
def get_club(club_id: int, db: Session = Depends(get_db)) -> ClubModel:
    club = db.get(ClubModel, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return club

@app.post("/clubs", response_model=Club, status_code=201)
def create_club(data: ClubCreate, db: Session = Depends(get_db)) -> ClubModel:
    club = ClubModel(**data.model_dump())
    db.add(club)
    db.commit()
    db.refresh(club)
    return club

@app.delete("/clubs/{club_id}", status_code=204)
def delete_club(club_id: int, db: Session = Depends(get_db)) -> None:
    club = db.get(ClubModel, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    db.delete(club)
    db.commit()

@app.patch("/clubs/{club_id}", response_model=Club)
def update_club(club_id: int, data: ClubUpdate, db: Session = Depends(get_db)) -> ClubModel:
    club = db.get(ClubModel, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(club, key, value)
    db.commit()
    db.refresh(club)
    return club
