from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.adicional import Adicional
from app.schemas.adicional_schema import AdicionalSchema
from typing import List

router = APIRouter(prefix="/api/adicionais", tags=["Adicionais"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[AdicionalSchema])
def listar_adicionais(db: Session = Depends(get_db)):
    return db.query(Adicional).all()
