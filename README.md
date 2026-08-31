# Jazz Booking App (JBA)

Kurze Übersicht
- Private Webanwendung zur Unterstützung beim Booking von Jazzbands.
- Tech Stack: Next.js (TypeScript) im `frontend/`, FastAPI (Python) im `backend/`, PostgreSQL als DB.

Quickstart (Linux)

1) Paketmanager (empfohlen): Corepack + `pnpm`

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

Falls du `pnpm` nicht nutzen willst, funktioniert `npm` ebenfalls:

```bash
npm install
npm run dev
```

2) Frontend starten

```bash
cd frontend
pnpm install   # oder npm install
pnpm dev       # oder npm run dev
```

3) Backend starten

```bash
cd backend
# falls noch nicht aktiviert: python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

4) Nächste Schritte
- `.env.example` im `backend/` anlegen (DB-URL, Secrets)
- Weitere Dokumentation in diesem `README.md` ergänzen

Mehr: Lies bitte die Entwicklerregeln in `AGENTS.md`.

**Contributing**

- Fork / clone this repository and create a feature branch for your work.
- Before running the backend, copy `backend/.env.example` to `backend/.env` and fill in secret values.
- Start frontend and backend locally (see Quickstart above) and ensure endpoints respond.
- Run linters and tests (add lint/test commands as they are added).
- Commit logically grouped changes with clear messages.
- Open a pull request describing the change and any manual test steps.

When you're ready to create the initial commit of these files locally, run:

```bash
git add .
git commit -m "chore: initial scaffold and docs"
git push -u origin YOUR_BRANCH
```
