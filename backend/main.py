
from fastapi import FastAPI, HTTPException
from fastapi import Depends

from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from models import BandModel, VenueModel, BookingModel
from schemas import Band, BandCreate, BandUpdate, Venue, VenueCreate, VenueUpdate, Booking, BookingCreate, BookingUpdate

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/venues", response_model=list[Venue])
def get_venues(db: Session = Depends(get_db)) -> list[Venue]:
    return list(db.scalars(select(VenueModel)).all())

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

@app.get("/bands", response_model=list[Band])
def get_bands(db: Session = Depends(get_db)) -> list[Band]:
    return list(db.scalars(select(BandModel)).all())

@app.get("/bookings", response_model=list[Booking])
def get_bookings(db: Session = Depends(get_db)) -> list[Booking]:
    return list(db.scalars(select(BookingModel)).all())

@app.get("/bookings/{booking_id}", response_model=Booking)
def get_booking(booking_id: int, db: Session = Depends(get_db)) -> BookingModel:
    booking = db.get(BookingModel, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@app.post("/bookings", response_model=Booking, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)) -> BookingModel:
    if db.get(BandModel, data.band_id) is None:
        raise HTTPException(status_code=404, detail="Band not found")
    if db.get(VenueModel, data.venue_id) is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    booking = BookingModel(**data.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@app.patch("/bookings/{booking_id}", response_model=Booking)
def update_booking(booking_id: int, data: BookingUpdate, db: Session = Depends(get_db)) -> BookingModel:
    booking = db.get(BookingModel, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return booking

@app.delete("/bookings/{booking_id}", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_db)) -> None:
    booking = db.get(BookingModel, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()

@app.get("/bands/{band_id}", response_model=Band)
def get_band(band_id: int, db: Session = Depends(get_db)) -> BandModel:
    band = db.get(BandModel, band_id)
    if band is None:
        raise HTTPException(status_code=404, detail="Band not found")
    return band

@app.post("/bands", response_model=Band, status_code=201)
def create_band(data: BandCreate, db: Session = Depends(get_db)) -> BandModel:
    band = BandModel(**data.model_dump())
    db.add(band)
    db.commit()
    db.refresh(band)
    return band

@app.patch("/bands/{band_id}", response_model=Band)
def update_band(band_id: int, data: BandUpdate, db: Session = Depends(get_db)) -> BandModel:
    band = db.get(BandModel, band_id)
    if band is None:
        raise HTTPException(status_code=404, detail="Band not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(band, key, value)
    db.commit()
    db.refresh(band)
    return band

@app.delete("/bands/{band_id}", status_code=204)
def delete_band(band_id: int, db: Session = Depends(get_db)) -> None:
    band = db.get(BandModel, band_id)
    if band is None:
        raise HTTPException(status_code=404, detail="Band not found")
    db.delete(band)
    db.commit()