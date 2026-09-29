

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from enums import VenueType, BookingStatus, EmailDraftStatus
from sqlalchemy import String, ForeignKey

class VenueModel(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    venue_type: Mapped[str] = mapped_column(String(50), default=VenueType.CLUB.value)
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)


class BandModel(Base):
    __tablename__ = "bands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    genre: Mapped[str | None] = mapped_column(String(200), nullable=True)
    lineup: Mapped[str | None] = mapped_column(Text, nullable=True)
    equipment: Mapped[str | None] = mapped_column(Text, nullable=True)
    equipment_pdf_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    epk_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    music_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    tech_rider_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    stage_plan_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    band_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_pdf_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    band_text_pdf_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)

class BookingModel(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    band_id: Mapped[int] = mapped_column(ForeignKey("bands.id"))
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id"))
    status: Mapped[str] = mapped_column(String(50), default=BookingStatus.DRAFT.value)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

class EmailDraftModel(Base):
    __tablename__ = "email_drafts"

    id: Mapped[int] = mapped_column(primary_key=True)
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id"))
    recipient_email: Mapped[str] = mapped_column(String(200))
    subject: Mapped[str] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
    String(50), default=EmailDraftStatus.DRAFT.value
)
