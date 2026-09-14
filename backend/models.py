
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from enums import VenueType

class VenueModel(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    venue_type: Mapped[str] = mapped_column(String(50), default=VenueType.CLUB.value)
    city: Mapped[str] = mapped_column(String(100))
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