from fastapi import APIRouter, Body
from app.services.firebase_push import send_push_notification

router = APIRouter()

@router.post("/notificacoes/push")
def enviar_notificacao_push(
    token: str = Body(...),
    title: str = Body(...),
    body: str = Body(...),
    image: str = Body(None)
):
    response = send_push_notification(token, title, body, image)
    return {"status": "enviado", "firebase_response": response}
