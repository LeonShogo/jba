from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

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

clubs: list[Club] = [
    Club(id=1, name="Club 1", city="Berlin"),
    Club(id=2, name="Club 2", city="Hamburg"),
]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/clubs", response_model=list[Club])
def get_clubs() -> list[Club]:
    return clubs

@app.get("/clubs/{club_id}", response_model=Club)
def get_club(club_id: int) -> Club:
    for club in clubs:
        if club.id == club_id:
            return club
    raise HTTPException(status_code=404, detail="Club not found")


@app.post("/clubs", response_model=Club, status_code=201)
def create_club(data: ClubCreate) -> Club:
    club = Club(id=len(clubs) + 1, **data.model_dump())
    clubs.append(club)
    return club