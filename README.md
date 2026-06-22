# Trao Travel — AI Travel Planner

A production-ready, multi-user AI travel planner that generates personalized itineraries, budget estimates, hotel suggestions, crowd predictions, and **weather-aware packing checklists** using Google Gemini 2.5 Flash.

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _Add your Vercel URL here_ |
| Backend  | https://ai-powered-trip-planner.onrender.com |
| API Base | https://ai-powered-trip-planner.onrender.com/api |
| Video    | _Add your 3–4 min walkthrough link here_ |

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 (App Router) + Tailwind CSS | Server-ready React, fast dev, responsive UI |
| Backend | Node.js + Express + TypeScript | Lightweight REST API with strong typing |
| Database | MongoDB Atlas + Mongoose | Flexible document store for nested itineraries |
| Auth | JWT + bcryptjs | Stateless, scalable session verification |
| AI | Google Gemini 2.5 Flash | Fast structured JSON generation for trip plans |
| Weather | Open-Meteo API (free) | Real climate data for packing recommendations |

## Features

- **JWT Authentication** — Register, login, `/api/auth/me` session validation, bcrypt password hashing
- **Multi-user isolation** — Every trip is scoped to `userId`; users cannot access others' data
- **AI Itinerary Generator** — Day-by-day plans from destination, duration, budget tier, interests, and travel month
- **Budget Estimation** — Accommodation, food, transport, activities, miscellaneous + total
- **Hotel Suggestions** — 3–5 AI-recommended hotels matched to budget tier
- **Editable Itinerary** — Add, edit, remove activities; regenerate individual days via AI
- **Weather-Aware Packing Assistant** _(Creative Feature)_ — Climate data + itinerary cross-referenced into categorized, checkable packing lists saved to MongoDB
- **AI Crowd Predictor** _(Bonus)_ — Crowd levels, best visiting times, and tips per attraction
- **Resilient AI** — 5-attempt exponential backoff (1s → 2s → 4s → 8s → 16s) on transient Gemini errors

## Project Structure

```
trao/
├── backend/
│   └── src/
│       ├── config/          # Env validation (Zod), MongoDB connection
│       ├── controllers/     # Request handlers + input validation
│       ├── middleware/      # JWT auth, centralized error handling
│       ├── models/          # Mongoose schemas (User, Trip)
│       ├── routes/          # API route definitions
│       ├── services/        # Business logic, Gemini AI, weather API
│       ├── types/           # TypeScript interfaces
│       └── server.ts        # Express entry point
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # Reusable UI (trips, auth, layout)
│       ├── context/         # AuthContext (JWT + cookie sync)
│       └── lib/             # API client + shared types
└── package.json             # npm workspaces monorepo
```

## Architecture & Data Flow

```
User (Browser)
    │
    ▼
Next.js Frontend ──JWT Bearer──▶ Express API ──▶ MongoDB Atlas
    │                                │
    │                                ├──▶ Open-Meteo (climate data)
    │                                └──▶ Google Gemini 2.5 Flash (AI)
    │
    └── localStorage + cookie (token sync for middleware)
```

1. User submits trip form (destination, days, month, budget, interests)
2. Backend fetches **real climate data** from Open-Meteo for the destination + travel month
3. Climate context is injected into the Gemini prompt alongside user preferences
4. Gemini returns structured JSON: itinerary, budget, hotels, categorized packing list, crowd predictions
5. Trip is saved to MongoDB with `userId` for strict data isolation
6. User edits itinerary, toggles packing checkboxes — all persisted via authenticated API calls

## Authentication & Authorization

- Passwords hashed with **bcrypt** (12 salt rounds); never returned in API responses
- **JWT** signed with `JWT_SECRET`, sent as `Authorization: Bearer <token>`
- `authenticate` middleware on all `/api/trips/*` routes — attaches `req.user._id`
- Every trip query includes `{ userId: req.user._id }` — prevents cross-user access
- Frontend validates token on load via `GET /api/auth/me`
- Next.js middleware redirects unauthenticated users away from `/dashboard` and `/trips`

## AI Agent Design

| Aspect | Implementation |
|--------|---------------|
| Model | `gemini-2.5-flash` |
| Output | `responseMimeType: application/json` for reliable parsing |
| Retries | 5 attempts, exponential backoff on 429/503/500 errors |
| Prompt | Strict JSON schema: itinerary, budget, hotels, packing (4 categories), crowds |
| Climate | Open-Meteo geocoding + historical monthly temps/precipitation injected into prompt |
| Day regen | Targeted prompt preserves trip context; merges new crowd predictions |

## Creative Feature: Weather-Aware Packing Assistant

**Problem:** Travelers pack too much or too little because generic lists ignore destination climate and planned activities.

**Solution:** Before calling Gemini, the backend fetches real climate data (avg high/low temps, rainfall) for the destination and travel month via Open-Meteo. The AI then generates a categorized packing list:

| Category | Examples |
|----------|---------|
| Travel Documents | Passport, visa, travel insurance |
| Activity-Specific Gear | Hiking boots, snorkel gear |
| Climate Wear | Rain jacket, SPF 50, thermal layers |
| Essentials | Adapter, medications, power bank |

Each item includes a **reason** tied to climate or itinerary. Users **check/uncheck** items in the UI; state persists to MongoDB via `PATCH /api/trips/:id/packing`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login & get JWT |
| GET | `/api/auth/me` | Yes | Validate session |
| POST | `/api/trips/generate` | Yes | Generate AI trip plan |
| GET | `/api/trips` | Yes | List user's trips |
| GET | `/api/trips/:id` | Yes | Get trip details |
| PUT | `/api/trips/:id` | Yes | Update trip |
| DELETE | `/api/trips/:id` | Yes | Delete trip |
| POST | `/api/trips/:id/activities` | Yes | Add activity to day |
| PUT | `/api/trips/:id/activities` | Yes | Edit activity |
| DELETE | `/api/trips/:id/activities` | Yes | Remove activity |
| PATCH | `/api/trips/:id/packing` | Yes | Toggle packing item checked |
| POST | `/api/trips/:id/regenerate-day` | Yes | Regenerate day via AI |
| GET | `/api/health` | No | Health check |

## Local Setup

### Prerequisites

- Node.js 18+ or 20 LTS
- MongoDB Atlas cluster
- Google AI Studio API key (Gemini)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Min 32 characters |
| `GEMINI_API_KEY` | Google AI Studio key |
| `FRONTEND_URL` | `http://localhost:3000` for local dev |

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run development servers

```bash
npm run dev          # Both frontend + backend
npm run dev:backend  # http://localhost:5000
npm run dev:frontend # http://localhost:3000
```

## Deployment

### Backend (Render)

1. Connect GitHub repo `kokkulatrilok03/AI-powered-trip-planner`
2. **Root Directory:** leave empty (repo root — monorepo)
3. **Build Command:** `npm install --include=dev && npm run build --workspace=backend`
4. **Start Command:** `npm run start --workspace=backend`
5. **Health Check Path:** `/api/health`
6. Add environment variables from `backend/.env.example`
7. Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

> **Important:** Do NOT use `npm run build` — that also builds the frontend and fails on Render. Backend only.

### Frontend (Vercel)

1. Import repo, set root to `frontend/`
2. Add `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
3. Deploy

## Design Decisions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| Monorepo with npm workspaces | Single repo, shared tooling, easy local dev |
| JWT in localStorage + cookie | Cookie enables Next.js middleware; localStorage for Axios interceptor |
| Open-Meteo over paid weather APIs | Free, no key required, sufficient for monthly climate averages |
| Gemini JSON mode | Eliminates markdown parsing failures; fallback extractor as safety net |
| Crowd Predictor as bonus | Complements packing assistant; helps users avoid peak hours |
| No real-time flight/booking APIs | Out of scope; keeps focus on AI planning quality |

## Known Limitations

- AI-generated hotel/pricing data is approximate, not live booking data
- Trip generation takes 30–60 seconds for longer itineraries
- Climate data uses prior-year monthly averages when exact forecast unavailable
- Packing list does not auto-refresh when itinerary is regenerated (manual re-generation would be needed)
- No offline support or PWA

## Verification Checklist

| Test | Expected |
|------|----------|
| `GET /api/trips` without token | `401 Unauthorized` |
| User A creates trip, User B logs in | User B sees empty dashboard |
| Invalid Gemini key | Console shows exponential retries (1s, 2s, 4s, 8s, 16s) then graceful error |
| Mobile viewport | Dashboard and trip detail stack vertically |

---

Built with care for the NXTWAVE Full Stack Engineering Assessment.
