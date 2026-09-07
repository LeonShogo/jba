# Jazz Booking App

Eine Webanwendung zur Verwaltung von Jazzbands, Clubs und Kontakten im Booking-Prozess.

Das Projekt befindet sich in aktiver Entwicklung. Der aktuelle Schwerpunkt liegt auf einer lokalen Club-Datenbank als Grundlage fuer spaetere Booking-Anfragen und personalisierte E-Mails.

## Aktueller Funktionsumfang

- Clubs anlegen, bearbeiten, anzeigen und loeschen
- Clubdaten mit Name, Stadt und optionalen Kontaktinformationen speichern
- Bands ueber eine REST-API verwalten
- Health-Check fuer das Backend unter `GET /health`

## Tech-Stack

- Frontend: Next.js, React und TypeScript
- Backend: FastAPI und SQLAlchemy
- Datenbank: PostgreSQL

## Lokale Entwicklung

Voraussetzungen: Node.js mit Corepack, Python 3 und eine laufende PostgreSQL-Datenbank.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Passe anschliessend `DATABASE_URL` in `backend/.env` an deine lokale PostgreSQL-Datenbank an. Die Datenbanktabellen muessen derzeit noch passend zu den Modellen angelegt werden.

### Frontend

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

Das Frontend ist anschliessend unter [http://localhost:3000](http://localhost:3000) erreichbar und erwartet das Backend unter `http://localhost:8001`.

## Konfiguration

Beispielwerte liegen in `backend/.env.example` und `frontend/.env.example`. Lokale `.env`-Dateien enthalten potenziell sensible Daten und werden nicht versioniert.

## Lizenz

Derzeit ist keine Lizenz vergeben.
