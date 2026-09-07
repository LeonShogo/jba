from pydantic import BaseModel


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

    