from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, get_session
from .models import File
from sqlmodel import Session

app = FastAPI(
    title="LayerZero API",
    description="Deadpool's favorite app. Nuff said.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # In production, we might use Alembic, but for now strict SQLModel sync
    init_db()
    pass

@app.get("/")
def read_root():
    return {"message": "LayerZero Online. Systems Nominal."}

# Slicer Microservice Endpoint
@app.post("/webhook/slice")
async def slice_file_webhook(file_id: str, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """
    Receives a webhook when a new file is uploaded.
    Triggers background slicing service.
    """
    # Logic to be implemented:
    # 1. Fetch File record
    # 2. Add slicing task to background_tasks
    return {"status": "Slicing queued", "file_id": file_id}
