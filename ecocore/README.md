# EcoCore Hackathon Setup (Netlify + Render + Groq)

This project uses:
- Frontend: React + Vite (deploy on Netlify)
- Backend: FastAPI in `backend/` (deploy on Render)
- LLM: Groq API (server-side key)
- Optional local fallback: Ollama

## 1) Local development

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend health check:
`http://localhost:8000/api/health`

## 2) Environment variables

### MongoDB (optional storage)

If you'd like to persist job requests or other data, the backend now
supports MongoDB. Set the following variables in your `.env`:

- `MONGO_URI` – full connection string for your cluster or local server.
- `MONGO_DB` – database name (defaults to `ecocore`).

A simple health check is available at `/api/health/db` which will report
`db: reachable` when the server can talk to the database.


Use `.env` at project root (already gitignored):

- `GROQ_API_KEY` (server only)
- `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
- `ALLOWED_ORIGINS` (comma-separated frontend origins)
- `VITE_API_BASE_URL` (frontend backend URL)
- `MONGO_URI` (connection string, e.g. `mongodb://localhost:27017` or a cloud URI)
- `MONGO_DB` (database name, default `ecocore`)

Important: never use `VITE_GROQ_API_KEY`; `VITE_` variables are exposed to browser.

## 3) Deploy backend to Render (free)

1. Push repo to GitHub.
2. In Render, create a new Web Service from repo.
3. Use `render.yaml` in project root, or configure manually:
	- Root directory: `backend`
	- Build command: `pip install -r requirements.txt`
	- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render dashboard:
	- `GROQ_API_KEY`
	- `GROQ_MODEL`
	- `ALLOWED_ORIGINS` (include Netlify URL)

## 4) Deploy frontend to Netlify (free)

1. Create Netlify site from your repo.
2. Build settings:
	- Base directory: `ecocore`
	- Build command: `npm run build`
	- Publish directory: `dist`
3. Add Netlify env variable:
	- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
4. Redeploy.

## 5) Demo flow in Jobs tab

When you click **Queue Job** in Jobs:
- Frontend calls `POST /api/jobs/plan`
- FastAPI calls Groq
- UI displays a planner note with recommended window and estimated savings
- If Groq is unavailable, backend returns a deterministic fallback plan

## 6) Optional Ollama fallback

You can keep local Ollama for offline judging/demo:
- Keep hosted mode as default (Render+Groq)
- Use local backend env for Ollama later if needed

