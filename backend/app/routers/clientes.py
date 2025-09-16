
from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.usuario import Usuario
from app.schemas.cliente_schema import ClienteResponseSchema

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("/fcm_tokens")
def listar_fcm_tokens(db: Session = Depends(lambda: SessionLocal())):
    """
    Retorna todos os tokens FCM válidos dos usuários cadastrados.
    """
    tokens = db.query(Usuario.fcm_token).filter(Usuario.fcm_token != None, Usuario.fcm_token != "").all()
    # Extrai apenas o valor do token do resultado
    return [t[0] for t in tokens]

@router.get("/")
def listar_clientes():
    """
    Retorna todos os clientes cadastrados (exemplo).
    Substitua por integração real com o banco de dados.
    """
    return [
        {"id": 1, "nome": "João da Silva"},
        {"id": 2, "nome": "Maria Souza"}
    ]

from pydantic import BaseModel

class FCMTokenRequest(BaseModel):
    fcm_token: str

@router.patch("/{id}/fcm_token", response_model=ClienteResponseSchema)
def atualizar_fcm_token(id: int, body: FCMTokenRequest, db: Session = Depends(lambda: SessionLocal())):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        return {"detail": "Usuário não encontrado"}
    usuario.fcm_token = body.fcm_token
    db.commit()
    db.refresh(usuario)
    return usuario
