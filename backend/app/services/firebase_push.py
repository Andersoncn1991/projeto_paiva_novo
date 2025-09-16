import firebase_admin
from firebase_admin import credentials, messaging
import os

# Caminho para o arquivo de credenciais
cred_path = os.path.join(os.path.dirname(__file__), '../paivasburguers-fa626-firebase-adminsdk-fbsvc-e13cb9cc93.json')

# Inicializa o Firebase apenas uma vez
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

def send_push_notification(token: str, title: str, body: str, image: str = None):
    notification = messaging.Notification(
        title=title,
        body=body,
        image=image if image else None
    )
    message = messaging.Message(
        notification=notification,
        token=token,
    )
    response = messaging.send(message)
    return response
