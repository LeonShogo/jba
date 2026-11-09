from pathlib import Path
import shutil

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles
from schemas import EmailDraftGenerateRequest, EmailDraftBatchGenerateRequest
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session
from database import get_db
from enums import EmailDraftStatus
from models import BandModel, VenueModel, BookingModel, EmailDraftModel
from schemas import VenueResearchRequest, Band, BandCreate, BandUpdate, Venue, VenueCreate, VenueUpdate, Booking, BookingCreate, BookingUpdate, EmailDraft,EmailDraftCreate, EmailDraftUpdate
from agents.venue_research import venue_research_graph
from agents.email_draft import generate_email_draft

app = FastAPI()
upload_directory = Path(__file__).resolve().parent / "uploads"
upload_directory.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_directory), name="uploads")

band_document_fields = {
    "equipment": "equipment_pdf_url",
    "tech-rider": "tech_rider_url",
    "stage-plan": "stage_plan_url",
    "description": "description_pdf_url",
    "band-text": "band_text_pdf_url",
}
maximum_pdf_size = 10 * 1024 * 1024


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/email-drafts/generate", response_model=EmailDraft, status_code=201)
def generate_booking_email(data: EmailDraftGenerateRequest, 
                           db: Session = Depends(get_db),) -> EmailDraftModel:
    
    booking = db.get(BookingModel, data.booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking nicht gefunden.")
    
    band = db.get(BandModel, booking.band_id)
    venue = db.get(VenueModel, booking.venue_id)
    
    if band is None or venue is None:
        raise HTTPException(status_code=404, detail="Band oder Venue nicht gefunden.")

    recipient_email = (venue.email or "").strip()
    if not recipient_email:
        raise HTTPException(
            status_code=422,
            detail="Bitte zuerst eine E-Mail-Adresse für die Venue hinterlegen.",
        )
    
    epk_labels = {
        "photos": "Pressefotos",
        "audio": "Album / Hörbeispiele",
        "videos": "Videos",
        "stage_plan": "Stageplan",
        "tech_rider": "Tech Rider",
        "short_bio": "kurzer Bandankündigungstext",
        "long_bio": "langer Bandankündigungstext",
    }
        
    selected_epk_labels = [
        epk_labels[item] for item in band.epk_contents if item in epk_labels
    ]
    
    epk_contents_text = ", ".join(selected_epk_labels)
    
    band_info = ( f"Bandname: {band.name}\n"
                  f"Genre: {band.genre or 'Nicht angegeben.'}\n"
                  f"Besetzung: {band.lineup or 'Nicht angegeben.'}\n"
                  f"Beschreibung: {band.description or 'Nicht angegeben.'}\n"
                  f"Bandtext: {band.band_text or 'Nicht angegeben'}\n"
                  f"Website: {band.website or 'Nicht angegeben'}\n"
                  f"Musiklink: {band.music_url or 'Nicht angegeben'}\n"
                  f"Pressemappe/EPK: {band.epk_url or 'Nicht angegeben'}\n"
                  f"Bestätigte EPK-Inhalte: {epk_contents_text or 'Keine Angaben'}\n"
                  f"Kontaktperson der Band: {band.contact_person or 'Nicht angegeben'}\n"
                  f"Telefon der Band: {band.phone or 'Nicht angegeben'}\n"
                  f"E-Mail der Band: {band.email or 'Nicht angegeben'}\n"
                  )
    
    
    
    venue_info = (
        f"Venuename: {venue.name}\n"
        f"Venue-Typ: {venue.venue_type}\n"
        f"Stadt: {venue.city}\n"
        f"Bundesland oder Region: {venue.state or 'Nicht angegeben'}\n"
        f"Land: {venue.country or 'Nicht angegeben'}\n"
        f"Ansprechperson: {venue.contact_person or 'Nicht angegeben'}\n"
        f"Website: {venue.website or 'Nicht angegeben'}\n"
    )
                    
                    
    tour_period = data.tour_period.strip()
    if not tour_period:
        raise HTTPException(status_code=422, detail="Bitte einen Tourzeitraum angeben.")

    generated = generate_email_draft(
        band_info=band_info,
        venue_info=venue_info,
        booking_notes=booking.notes or "",
        tour_period=tour_period,
        draft_notes=data.notes.strip(),
        style_attributes=[attribute.value for attribute in data.style_attributes],
        length=data.length,
    )
    
    draft = EmailDraftModel(
        booking_id=booking.id,
        recipient_email=recipient_email,
        subject=generated.subject,
        body=generated.body,
        status=EmailDraftStatus.DRAFT.value,
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft
@app.post("/email-drafts/generate-batch", response_model=list[EmailDraft], status_code=201)
def generate_booking_mail_batch(
    data: EmailDraftBatchGenerateRequest,
    db: Session = Depends(get_db),
) -> list[EmailDraftModel]:
    if len(set(data.booking_ids)) != len(data.booking_ids):
        raise HTTPException(
            status_code=422,
            detail="Ein Booking wurde mehrfach ausgewählt.",
        )

    bookings = db.scalars(
        select(BookingModel).where(BookingModel.id.in_(data.booking_ids))
    ).all()

    if len(bookings) != len(data.booking_ids):
        raise HTTPException(
            status_code=404,
            detail="Mindestens ein Booking wurde nicht gefunden.",
        )

    prepared_bookings = []

    for booking in bookings:
        band = db.get(BandModel, booking.band_id)
        venue = db.get(VenueModel, booking.venue_id)

        if band is None or venue is None:
            raise HTTPException(status_code=404, detail="Band oder Venue nicht gefunden.")

        recipient_email = (venue.email or "").strip()
        if not recipient_email:
            raise HTTPException(
                status_code=422,
                detail=f"Bitte E-Mail für Venue {venue.name} hinterlegen.",
            )

        prepared_bookings.append((booking, band, venue, recipient_email))

    batch_id = str(uuid4())
    drafts = []
    tour_period = data.tour_period.strip()
    if not tour_period:
        raise HTTPException(status_code=422, detail="Bitte einen Tourzeitraum eingeben.")

    for booking, band, venue, recipient_email in prepared_bookings:
        band_info = (
            f"Bandname: {band.name}\n"
            f"Genre: {band.genre or 'Nicht angegeben.'}\n"
            f"Besetzung: {band.lineup or 'Nicht angegeben.'}\n"
            f"Beschreibung: {band.description or 'Nicht angegeben.'}\n"
            f"EPK-Link: {band.epk_url or 'Nicht angegeben.'}\n"
        )

        venue_info = (
            f"Venuename: {venue.name}\n"
            f"Venue-Typ: {venue.venue_type}\n"
            f"Stadt: {venue.city}\n"
            f"Land: {venue.country or 'Nicht angegeben.'}\n"
            f"Ansprechperson: {venue.contact_person or 'Nicht angegeben.'}\n"
        )

        generated = generate_email_draft(
            band_info=band_info,
            venue_info=venue_info,
            booking_notes=booking.notes or "",
            tour_period=tour_period,
            draft_notes=data.notes.strip(),
            style_attributes=[attribute.value for attribute in data.style_attributes],
            length=data.length,
        )

        draft = EmailDraftModel(
            booking_id=booking.id,
            batch_id=batch_id,
            recipient_email=recipient_email,
            subject=generated.subject,
            body=generated.body,
            status=EmailDraftStatus.DRAFT.value,
        )
        db.add(draft)
        drafts.append(draft)

    db.commit()
    for draft in drafts:
        db.refresh(draft)

    return drafts

@app.post("/venue-research")
def research_venues(data: VenueResearchRequest, db: Session = Depends(get_db),) -> dict[str, object]:
    result = venue_research_graph.invoke(
        data.model_dump()
    )
    candidates = result.get("venue_candidates", [])
    
    if data.mode == "review":
        return {"venue_candidates": candidates, "saved_count": 0}
    
    saved_count = 0
    
    existing_venues = db.scalars(select(VenueModel)).all()
    
    existing_keys = { (venue.name.strip().casefold(), 
                       venue.city.strip().casefold())
                     for venue in existing_venues}
    
    for candidate in candidates:
        key = ( 
               candidate["name"].strip().casefold(),
               candidate["city"].strip().casefold(),)
        
        if key in existing_keys:
              continue
          
        venue_data = {}
        
        for field, value in candidate.items():
            if field != "source_url":
                venue_data[field] = value
        
        db.add(VenueModel(**venue_data))
        existing_keys.add(key)
        saved_count += 1
    
    db.commit()
    
    return {"venue_candidates": candidates, 
            "saved_count": saved_count}
    


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
    
    normalized_name = data.name.strip().casefold()
    
    normalized_city = data.city.strip().casefold()
    
    existing_venues = db.scalars(select(VenueModel)).all()
    
    for ex_venue in existing_venues:
        
        ex_name = ex_venue.name.strip().casefold()
        
        ex_city = ex_venue.city.strip().casefold()
        
        if ex_name == normalized_name and ex_city == normalized_city:
            raise HTTPException(status_code=409, 
                                detail="Die Venue ist bereits in der Datenbank enthalten")      
    
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
    shutil.rmtree(upload_directory / "bands" / str(band_id), ignore_errors=True)


@app.post("/bands/{band_id}/documents/{document_type}", response_model=Band)
async def upload_band_document(
    band_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> BandModel:
    band = db.get(BandModel, band_id)
    if band is None:
        raise HTTPException(status_code=404, detail="Band not found")

    field = band_document_fields.get(document_type)
    if field is None:
        raise HTTPException(status_code=400, detail="Unknown document type")

    contents = await file.read(maximum_pdf_size + 1)
    await file.close()
    if len(contents) > maximum_pdf_size:
        raise HTTPException(status_code=413, detail="PDF is larger than 10 MB")
    if file.content_type != "application/pdf" or b"%PDF-" not in contents[:1024]:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    band_directory = upload_directory / "bands" / str(band_id)
    band_directory.mkdir(parents=True, exist_ok=True)
    file_path = band_directory / f"{document_type}.pdf"
    file_path.write_bytes(contents)

    setattr(band, field, f"/uploads/bands/{band_id}/{document_type}.pdf")
    db.commit()
    db.refresh(band)
    return band


@app.delete("/bands/{band_id}/documents/{document_type}", status_code=204)
def delete_band_document(
    band_id: int,
    document_type: str,
    db: Session = Depends(get_db),
) -> None:
    band = db.get(BandModel, band_id)
    if band is None:
        raise HTTPException(status_code=404, detail="Band not found")

    field = band_document_fields.get(document_type)
    if field is None:
        raise HTTPException(status_code=400, detail="Unknown document type")

    file_path = upload_directory / "bands" / str(band_id) / f"{document_type}.pdf"
    file_path.unlink(missing_ok=True)
    setattr(band, field, None)
    db.commit()

@app.get("/email-drafts", response_model=list[EmailDraft])
def get_email_drafts(db: Session = Depends(get_db)) -> list[EmailDraft]:
    return list(db.scalars(select(EmailDraftModel)).all())


@app.get("/email-drafts/{draft_id}", response_model=EmailDraft)
def get_email_draft(
    draft_id: int,
    db: Session = Depends(get_db),) -> EmailDraftModel:
    draft = db.get(EmailDraftModel, draft_id)

    if draft is None:
        raise HTTPException(status_code=404, detail="Email draft not found")

    return draft


@app.post("/email-drafts", response_model=EmailDraft, status_code=201)
def create_email_draft(
    data: EmailDraftCreate,
    db: Session = Depends(get_db),
) -> EmailDraftModel:
    if db.get(BookingModel, data.booking_id) is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    draft = EmailDraftModel(**data.model_dump())
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft


@app.patch("/email-drafts/{draft_id}", response_model=EmailDraft)
def update_email_draft(
    draft_id: int,
    data: EmailDraftUpdate,
    db: Session = Depends(get_db),
) -> EmailDraftModel:
    draft = db.get(EmailDraftModel, draft_id)

    if draft is None:
        raise HTTPException(status_code=404, detail="Email draft not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(draft, key, value)

    db.commit()
    db.refresh(draft)
    return draft


@app.delete("/email-drafts/{draft_id}", status_code=204)
def delete_email_draft(
    draft_id: int,
    db: Session = Depends(get_db),
) -> None:
    draft = db.get(EmailDraftModel, draft_id)

    if draft is None:
        raise HTTPException(status_code=404, detail="Email draft not found")

    db.delete(draft)
    db.commit()
