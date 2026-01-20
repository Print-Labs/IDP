# LayerZero

Campus-focused 3D printing service platform.

## Architecture
- **Backend**: FastAPI (Python 3.11+) + SQLModel
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js 14 + Tailwind + Shadcn/UI
- **Slicing**: PrusaSlicer (Headless)

## Setup

### Backend
1. Navigate to `/backend`
2. Create virtual environment: `python -m venv venv`
3. Activate venv: `.\venv\Scripts\Activate`
4. Install reqs: `pip install -r requirements.txt`
5. Run: `uvicorn main:app --reload`

Env (`.env`):
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.bpumuzplhqjlxjzhlxjk.supabase.co:5432/postgres
```

### Frontend
1. Navigate to `/frontend`
2. Install: `npm install`
3. Run: `npm run dev`

Env (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://bpumuzplhqjlxjzhlxjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_KEY]
```

## Status
- Core Schemas: Defined (`backend/models.py`)
- Slicer Service: Stubbed (`backend/services/slicer.py`)
- Financial Engine: Stubbed (`backend/services/finance.py`)
- Frontend: Initialized with Shadcn/UI
