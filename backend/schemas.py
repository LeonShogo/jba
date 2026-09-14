from pydantic import BaseModel
from enums import VenueType, BookingStatus

class Band(BaseModel):
    id: int
    name: str
    email: str | None = None
    website: str | None = None
    contact_person: str | None = None
    phone: str | None = None

class BandCreate(BaseModel):
    name: str
    email: str | None = None
    website: str | None = None
    contact_person: str | None = None
    phone: str | None = None

class BandUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    website: str | None = None
    contact_person: str | None = None
    phone: str | None = None

class Venue(BaseModel):
    id: int
    venue_type: VenueType
    name: str
    city: str
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None

class VenueCreate(BaseModel):
    venue_type: VenueType = VenueType.CLUB
    name: str
    city: str
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None

class VenueUpdate(BaseModel):
    venue_type: VenueType | None = None
    name: str | None = None
    city: str | None = None
    website: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None

class Booking(BaseModel):
    id: int
    band_id: int
    venue_id: int
    status: BookingStatus
    notes: str | None = None

class BookingCreate(BaseModel):
    band_id: int
    venue_id: int
    notes: str | None = None

class BookingUpdate(BaseModel):
    status: BookingStatus | None = None
    notes: str | None = None


