
from fastapi import FastAPI, HTTPException
from fastapi import Depends

from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from models import BandModel, VenueModel
from schemas import Band, BandCreate, Venue, VenueCreate, VenueUpdate

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/venues", response_model=list[Venue])
def get_venues(db: Session = Depends(get_db)) -> list[Venue]:
    return list(db.scalars(select(VenueModel)).all())

@app.get("/bands", response_model=list[Band])
def get_bands(db: Session = Depends(get_db)) -> list[Band]:
    return list(db.scalars(select(BandModel)).all())

@app.post("/bands", response_model=Band, status_code=201)
def create_band(data: BandCreate, db: Session = Depends(get_db)) -> BandModel:
    band = BandModel(**data.model_dump())
    db.add(band)
    db.commit()
    db.refresh(band)
    return band

@app.get("/venues/{venue_id}", response_model=Venue)
def get_venue(venue_id: int, db: Session = Depends(get_db)) -> VenueModel:
    venue = db.get(VenueModel, venue_id)
    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@app.post("/venues", response_model=Venue, status_code=201)
def create_venue(data: VenueCreate, db: Session = Depends(get_db)) -> VenueModel:
    venue = VenueModel(**data.model_dump())
    db.add(venue)
    db.commit()
    db.refresh(venue)
    return venue

@app.delete("/venues/{venue_id}", status_code=204)
def delete_venue(venue_id: int, db: Session = Depends(get_db)) -> None:
    venue = db.get(VenueModel, venue_id)
    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    db.delete(venue)
    db.commit()

@app.patch("/venues/{venue_id}", response_model=Venue)
def update_venue(venue_id: int, data: VenueUpdate, db: Session = Depends(get_db)) -> VenueModel:
    venue = db.get(VenueModel, venue_id)
    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(venue, key, value)
    db.commit()
    db.refresh(venue)
    return venue
