import os
import csv
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import InventorySource
import uuid

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

DATA_DIR = "/app/data" if os.environ.get("DATABASE_URL") else "./data"

@router.post("/upload")
async def upload_inventory(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_session)
):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        file_path = os.path.join(DATA_DIR, file.filename)
        
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        source = InventorySource(
            id=str(uuid.uuid4()),
            name=name,
            type="csv",
            file_path=file_path
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        return {"success": True, "source": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_inventory(db: Session = Depends(get_session)):
    sources = db.exec(select(InventorySource)).all()
    return sources

@router.get("/{id}/data")
def get_inventory_data(id: str, db: Session = Depends(get_session)):
    source = db.get(InventorySource, id)
    if not source or source.type != "csv":
        raise HTTPException(status_code=404, detail="Source not found or invalid CSV")
        
    if not os.path.exists(source.file_path):
        raise HTTPException(status_code=404, detail="File missing from disk")
        
    data = []
    with open(source.file_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
            
    return data
