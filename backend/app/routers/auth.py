# ================================
# Arquivo de rotas de autenticação (auth.py)
# Responsável por todas as rotas de login, cadastro, autenticação JWT e login Google OAuth2.
# Cada rota e classe possui comentários explicativos detalhando sua função e regras de negócio.
# ================================


SECRET_KEY = "paivas-burguers-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Imports principais
from fastapi import APIRouter, HTTPException, status, Depends, Body, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.requests import Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime, timedelta
from typing import Optional
import os
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db import SessionLocal
from app.models.usuario import Usuario
from app.services.usuario_service import get_user_by_email, create_usuario, verify_password, get_password_hash, update_usuario



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
router = APIRouter(prefix="/auth", tags=["auth"])




# Função utilitária para obter o usuário autenticado via JWT
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        db: Session = SessionLocal()
        try:
            usuario = get_user_by_email(db, email)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
            return usuario
        finally:
            db.close()
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Modelo para completar perfil
class CompleteProfileRequest(BaseModel):
    nome: str
    telefone: str
    rua: str
    numero: str
    complemento: str = ""
    bairro: str
    cidade: str
    cep: str
    aceite_termos: bool
    senha: str = None
    confirmacao_senha: str = None

# Endpoint para completar perfil do usuário
@router.post("/complete-profile")
def complete_profile(request: CompleteProfileRequest, current_user: Usuario = Depends(get_current_user)):
    from app.services.usuario_service import get_password_hash
    db: Session = SessionLocal()
    try:
        # Validação obrigatória dos campos essenciais
        required_fields = [
            ('nome', request.nome),
            ('telefone', request.telefone),
            ('rua', request.rua),
            ('numero', request.numero),
            ('bairro', request.bairro),
            ('cidade', request.cidade),
            ('cep', request.cep),
            ('aceite_termos', request.aceite_termos),
        ]
        for field, value in required_fields:
            if value is None or (isinstance(value, str) and not value.strip()):
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail=f"O campo '{field}' é obrigatório.")
        if not request.aceite_termos:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="É necessário aceitar os termos para continuar.")

        # Se senha for enviada, validar e atualizar senha_hash
        update_data = request.dict()
        usuario_id = int(getattr(current_user, 'id', 0))
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if request.senha:
            if not request.confirmacao_senha or request.senha != request.confirmacao_senha:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="As senhas não coincidem.")
            update_data["senha_hash"] = get_password_hash(request.senha)
        # Não atualizar senha_hash se não foi enviada
        update_data.pop("senha", None)
        update_data.pop("confirmacao_senha", None)
        update_data["aceite_termos"] = request.aceite_termos
        if usuario is None:
            # Cria novo usuário se não existir (caso raro)
            update_data["email"] = getattr(current_user, 'email', None)
            usuario = create_usuario(db, update_data)
            return {"message": "Cadastro realizado com sucesso!"}
        else:
            aceite_termos_antes = usuario.aceite_termos
            update_usuario(db, usuario_id, update_data)
            if aceite_termos_antes is False and request.aceite_termos is True:
                return {"message": "Cadastro realizado com sucesso!"}
            else:
                return {"message": "Cadastro atualizado com sucesso!"}
    finally:
        db.close()

# Endpoint de autenticação tradicional (usuário/senha) para OAuth2
from fastapi.security import OAuth2PasswordRequestForm


# Função para gerar refresh token seguro
import secrets
def gerar_refresh_token():
    return secrets.token_urlsafe(48)

# Função para calcular expiração do refresh token (ex: 7 dias)
def calcular_expiracao_refresh():
    return datetime.utcnow() + timedelta(days=7)

@router.post("/token")
def login_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db: Session = SessionLocal()
    try:
        usuario = get_user_by_email(db, form_data.username)
        if not usuario or not verify_password(form_data.password, usuario.senha_hash):
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

        access_token = jwt.encode({
            "sub": usuario.email,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)

        # Gera e adiciona novo refresh token à lista
        import json
        refresh_token = gerar_refresh_token()
        refresh_expira_em = calcular_expiracao_refresh()
        tokens = []
        if usuario.refresh_tokens:
            try:
                tokens = json.loads(usuario.refresh_tokens)
            except Exception:
                tokens = []
        # Remove tokens expirados
        now = datetime.utcnow()
        tokens = [t for t in tokens if t.get("expira_em") and datetime.fromisoformat(t["expira_em"]) > now]
        # Adiciona novo token
        tokens.append({"token": refresh_token, "expira_em": refresh_expira_em.isoformat()})
        usuario.refresh_tokens = json.dumps(tokens)
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": getattr(usuario, "role", None),
            "user": {
                "id": usuario.id,
                "email": usuario.email,
                "role": getattr(usuario, "role", None),
                "tipo": getattr(usuario, "tipo", None),
                "isAdmin": getattr(usuario, "isAdmin", False),
                "avatar_url": getattr(usuario, "avatar_url", None),
                # Adicione outros campos necessários
            }
        }
    finally:
        db.close()

# Endpoint para renovar access token usando refresh token
class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/refresh-token")
def refresh_access_token(request: RefreshTokenRequest):
    db: Session = SessionLocal()
    try:
        import json
        print(f"[LOG] /auth/refresh-token chamado. Token recebido: {request.refresh_token}")
        # Buscar usuário que possui o refresh token na lista
        usuario = None
        for u in db.query(Usuario).filter(Usuario.refresh_tokens != None).all():
            try:
                tokens = json.loads(u.refresh_tokens)
            except Exception:
                tokens = []
            for t in tokens:
                if t["token"] == request.refresh_token:
                    usuario = u
                    print(f"[LOG] Token encontrado no usuário: {u.email}")
                    break
            if usuario:
                break
        if not usuario:
            print(f"[LOG] Token NÃO encontrado em nenhum usuário.")
            raise HTTPException(status_code=401, detail="Refresh token inválido")
        tokens = []
        try:
            tokens = json.loads(usuario.refresh_tokens)
        except Exception:
            tokens = []
        now = datetime.utcnow()
        # Busca o token válido
        token_obj = None
        for t in tokens:
            if t["token"] == request.refresh_token:
                expira_em = datetime.fromisoformat(t["expira_em"])
                print(f"[LOG] Token encontrado. Expira em: {expira_em} | Agora: {now}")
                if expira_em > now:
                    token_obj = t
                    print(f"[LOG] Token está VÁLIDO.")
                else:
                    print(f"[LOG] Token está EXPIRADO.")
                break
        if not token_obj:
            print(f"[LOG] Token inválido ou expirado.")
            raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")
        # Gera novo access token
        access_token = jwt.encode({
            "sub": usuario.email,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)
        # Renova o refresh token (troca só o token usado)
        novo_refresh_token = gerar_refresh_token()
        novo_refresh_expira_em = calcular_expiracao_refresh()
        # Remove o antigo e adiciona o novo
        tokens = [t for t in tokens if t["token"] != request.refresh_token]
        tokens.append({"token": novo_refresh_token, "expira_em": novo_refresh_expira_em.isoformat()})
        usuario.refresh_tokens = json.dumps(tokens)
        db.commit()
        return {
            "access_token": access_token,
            "refresh_token": novo_refresh_token,
            "token_type": "bearer"
        }
    finally:
        db.close()


# Função utilitária para obter o usuário autenticado via JWT (apenas uma vez no arquivo)
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        db: Session = SessionLocal()
        try:
            usuario = get_user_by_email(db, email)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
            return usuario
        finally:
            db.close()
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")



# Endpoint para obter dados do usuário autenticado (/auth/me)
@router.get("/me")
def me(current_user: Usuario = Depends(get_current_user)):
    # Retorna os dados do usuário autenticado (exceto senha)
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "telefone": current_user.telefone,
        "rua": current_user.rua,
        "numero": current_user.numero,
        "complemento": current_user.complemento,
        "bairro": current_user.bairro,
        "cidade": current_user.cidade,
        "cep": current_user.cep,
        "aceite_termos": current_user.aceite_termos,
        "role": getattr(current_user, "role", "cliente"),
        "avatarUrl": getattr(current_user, "avatar_url", None),
        "created_at": getattr(current_user, "created_at", None)
    }

# Endpoint para atualizar dados do perfil (exceto nome/email)
from fastapi import UploadFile, File
from sqlalchemy.exc import SQLAlchemyError

class UpdateProfileRequest(BaseModel):
    """Modelo de atualização parcial de perfil.
    Todos os campos são opcionais para permitir que apenas os alterados sejam enviados.
    Campos enviados vazios ("" ou apenas espaços) serão ignorados para não sobrescrever com vazio sem querer.
    """
    telefone: str | None = None
    rua: str | None = None
    numero: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    cep: str | None = None

@router.put("/update-profile")
def update_profile(
    payload: dict = Body(default={}),
    current_user: Usuario = Depends(get_current_user)
):
    db: Session = SessionLocal()
    try:
        raw_data = payload or {}
        # Apenas campos realmente enviados e não vazios
        update_data = {
            k: v.strip() if isinstance(v, str) else v
            for k, v in raw_data.items()
            if v is not None and (not isinstance(v, str) or v.strip() != "")
        }
        if not update_data:
            return {"message": "Nada para atualizar"}
        usuario_id = int(getattr(current_user, 'id', 0))
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        from app.services.usuario_service import update_usuario
        update_usuario(db, usuario_id, update_data)
        # Buscar novamente dados atualizados para retornar ao cliente
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado após atualização")
        return {
            "message": "Perfil atualizado com sucesso!",
            "updated_fields": list(update_data.keys()),
            "data": {
                "id": getattr(usuario, 'id', None),
                "nome": getattr(usuario, 'nome', None),
                "email": getattr(usuario, 'email', None),
                "telefone": getattr(usuario, 'telefone', None),
                "rua": getattr(usuario, 'rua', None),
                "numero": getattr(usuario, 'numero', None),
                "complemento": getattr(usuario, 'complemento', None),
                "bairro": getattr(usuario, 'bairro', None),
                "cidade": getattr(usuario, 'cidade', None),
                "cep": getattr(usuario, 'cep', None),
                "avatarUrl": getattr(usuario, 'avatar_url', None),
                "created_at": getattr(usuario, 'created_at', None)
            }
        }
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao atualizar perfil")
    finally:
        db.close()

# Endpoint para trocar senha
class ChangePasswordRequest(BaseModel):
    senha: str
    confirmacao_senha: str

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, current_user: Usuario = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        if not request.senha or not request.confirmacao_senha or request.senha != request.confirmacao_senha:
            raise HTTPException(status_code=400, detail="As senhas não coincidem.")
        from app.services.usuario_service import get_password_hash, update_usuario
        usuario_id = int(getattr(current_user, 'id', 0))
        update_usuario(db, usuario_id, {"senha_hash": get_password_hash(request.senha)})
        return {"message": "Senha alterada com sucesso!"}
    finally:
        db.close()

# Endpoint para upload de avatar
import shutil
@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: Usuario = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        usuario_id = int(getattr(current_user, 'id', 0))
        original_name = file.filename or 'avatar.png'
        ext = original_name.split('.')[-1].lower() if '.' in original_name else 'png'
        filename = f"user_{usuario_id}.{ext}"
        save_path = os.path.join("app", "static", "avatars", filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Salva o caminho relativo no banco
        avatar_url = f"/static/avatars/{filename}"
        from app.services.usuario_service import update_usuario
        update_usuario(db, usuario_id, {"avatar_url": avatar_url})
        return {"avatarUrl": avatar_url}
    finally:
        db.close()

# Endpoint para excluir conta
@router.delete("/delete-account")
def delete_account(current_user: Usuario = Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        usuario_id = int(getattr(current_user, 'id', 0))
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        db.delete(usuario)
        db.commit()
        return {"message": "Conta excluída com sucesso!"}
    finally:
        db.close()

# ================================
# Modelo de requisição para cadastro de usuário
# Utilizado no endpoint /auth/register
# ================================
class RegisterRequest(BaseModel):
    nome: str  # Nome completo do usuário
    email: EmailStr  # E-mail do usuário
    telefone: str  # Telefone (WhatsApp preferencialmente)
    rua: str  # Endereço: rua/avenida
    numero: str  # Endereço: número
    complemento: str = ""  # Endereço: complemento (opcional)
    bairro: str  # Endereço: bairro
    cidade: str  # Endereço: cidade
    cep: str  # Endereço: CEP
    senha: str  # Senha
    confirmacao_senha: str  # Confirmação de senha
    aceite_termos: bool  # Aceite dos termos de uso
    role: str = "cliente"  # Perfil do usuário (cliente/admin)

# ================================
# Endpoint de cadastro de usuário
# Valida dados, verifica duplicidade de e-mail, confere senha e aceite de termos.
# Cria novo usuário no banco de dados.
# ================================
@router.post("/register")
def register(request: RegisterRequest):
    db: Session = SessionLocal()
    try:
        if get_user_by_email(db, request.email):
            raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
        if request.senha != request.confirmacao_senha:
            raise HTTPException(status_code=400, detail="As senhas não coincidem.")
        if not request.aceite_termos:
            raise HTTPException(status_code=400, detail="É necessário aceitar os termos.")
        usuario = create_usuario(db, {
            "nome": request.nome,
            "email": request.email,
            "telefone": request.telefone,
            "rua": request.rua,
            "numero": request.numero,
            "complemento": request.complemento,
            "bairro": request.bairro,
            "cidade": request.cidade,
            "cep": request.cep,
            "senha_hash": get_password_hash(request.senha),
            "aceite_termos": request.aceite_termos,
            "role": request.role,
        })
        # Envia e-mail de boas-vindas
        try:
            from app.services.email_service import send_email
            html = f"""
            <div style='font-family:Arial,sans-serif;background:#fff;padding:32px;border-radius:12px;text-align:center;'>
                <img src='https://i.imgur.com/ZA2rPjW.png' alt='Paivas Burguers' style='width:120px;margin-bottom:16px;'>
                <h1 style='color:#232323;'>🍔🥤 Bem-vindo(a), {request.nome}! 🥳</h1>
                <p style='font-size:18px;'>Seu cadastro foi realizado com sucesso!<br>Agora você faz parte da nossa Lanchonete e Hamburgueria, especializada em lanches e hambúrgueres artesanais, batatas crocantes e momentos deliciosos.</p>
                <div style='margin:24px 0;'>
                    <ul style='list-style:none;padding:0;font-size:17px;'>
                        <li>🍔 Lanches irresistíveis</li>
                        <li>🎁 Promoções exclusivas</li>
                        <li>👨‍🍳 Atendimento de primeira</li>
                        <li>🚀 Novidades toda semana</li>
                    </ul>
                </div>
                <hr style='margin:24px 0;'>
                <p style='color:#232323;'>Fique à vontade para explorar nosso cardápio, fazer pedidos e aproveitar cada mordida.<br>Qualquer dúvida, estamos sempre por aqui!</p>
                <p style='margin-top:32px;font-size:15px;color:#888;'>Um grande abraço da equipe Paivas Burguers! 😋🍟</p>
            </div>
            """
            send_email(request.email, "Bem-vindo ao Paivas Burguers!", html)
        except Exception as e:
            print(f"Falha ao enviar e-mail de boas-vindas: {e}")
        return {"message": "Usuário cadastrado com sucesso!"}
    finally:
        db.close()

# ================================
# Endpoint para iniciar o fluxo OAuth2 do Google (login via popup)
# Redireciona o usuário para autenticação Google e retorna JWT ao frontend.
# ================================
@router.get("/google-login/web", response_class=HTMLResponse)
def google_login_web():
    """
    Inicia o fluxo OAuth2 do Google para login via popup no frontend.
    Após autenticação, retorna o JWT para o frontend via window.opener.postMessage.
    """
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://127.0.0.1:8000/auth/google-login/web/callback"
    # Monta URL de autorização Google
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=id_token%20token&scope=openid%20email%20profile&prompt=select_account&nonce=paivasburguers"
    )
    # HTML que redireciona para o Google
    return f"""
    <html><head><title>Login Google</title></head><body>
    <script>window.location.href = '{url}';</script>
    </body></html>
    """

# ================================
# Callback do Google OAuth2 (login via popup)
# Recebe o token do Google, autentica, gera JWT e envia ao frontend via postMessage.
# ================================
@router.get("/google-login/web/callback", response_class=HTMLResponse)
def google_login_web_callback(request: Request):
    """
    Recebe o token do Google, autentica, gera JWT e envia ao frontend via postMessage.
    """
    # O token vem na hash da URL (fragment), então precisa de JS para capturar
    return """
    <html><head><title>Login Google</title></head><body>
    <script>
    // Extrai access_token da hash
    const params = new URLSearchParams(window.location.hash.substr(1));
    const id_token_google = params.get('id_token');
    if (!id_token_google) {
      window.close();
    } else {
      // Envia token para backend para trocar por JWT
      fetch('http://127.0.0.1:8000/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id_token_google=' + encodeURIComponent(id_token_google)
      })
      .then(resp => resp.json())
      .then(data => {
        if (data.access_token) {
          // Busca se precisa de cadastro (aceite_termos == false)
          let needs_registration = false;
          let user = {};
          if (data.user) {
            needs_registration = data.user.aceite_termos === false;
            user = { email: data.user.email, name: data.user.nome };
          }
          window.opener.postMessage({
            type: 'google-jwt',
            token: data.access_token,
            needs_registration: needs_registration,
            user: user
          }, 'http://localhost:5173');
        }
        window.close();
      })
      .catch(() => window.close());
    }
    </script>
    </body></html>
    """

# ================================
# Endpoint para obter dados do usuário autenticado (/auth/me)
# Decodifica o JWT, busca o usuário no banco e retorna dados completos.
# ================================
@router.post("/google-login")
def google_login(id_token_google: str = Form(...)):
    """
    Recebe o id_token do Google, valida, cria/busca usuário e retorna JWT.
    """
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    try:
        # Valida o id_token com o Google
        idinfo = id_token.verify_oauth2_token(id_token_google, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        nome = idinfo.get("name", "")
        if not email:
            raise HTTPException(status_code=400, detail="E-mail não encontrado no token Google")
    except Exception:
        raise HTTPException(status_code=401, detail="Token Google inválido")

    db: Session = SessionLocal()
    try:
        usuario = get_user_by_email(db, email)
        is_new = False
        if usuario is None:
            # Cria usuário novo com dados mínimos
            senha_aleatoria = os.urandom(8).hex()
            usuario = create_usuario(db, {
                "nome": nome,
                "email": email,
                "telefone": "",
                "rua": "",
                "numero": "",
                "complemento": "",
                "bairro": "",
                "cidade": "",
                "cep": "",
                "senha_hash": get_password_hash(senha_aleatoria),
                "aceite_termos": False
            })
            is_new = True
            # Envia e-mail de boas-vindas
            try:
                from app.services.email_service import send_email
                html = f"""
                <div style='font-family:Arial,sans-serif;background:#fff;padding:32px;border-radius:12px;text-align:center;'>
                    <img src='https://i.imgur.com/ZA2rPjW.png' alt='Paivas Burguers' style='width:120px;margin-bottom:16px;'>
                    <h1 style='color:#232323;'>🍔🥤 Bem-vindo(a), {nome}! 🥳</h1>
                    <p style='font-size:18px;'>Seu cadastro foi realizado com sucesso!<br>Agora você faz parte da nossa Lanchonete e Hamburgueria, especializada em lanches e hambúrgueres artesanais, batatas crocantes e momentos deliciosos.</p>
                    <div style='margin:24px 0;'>
                        <ul style='list-style:none;padding:0;font-size:17px;'>
                            <li>🍔 Lanches irresistíveis</li>
                            <li>🎁 Promoções exclusivas</li>
                            <li>👨‍🍳 Atendimento de primeira</li>
                            <li>🚀 Novidades toda semana</li>
                        </ul>
                    </div>
                    <hr style='margin:24px 0;'>
                    <p style='color:#232323;'>Fique à vontade para explorar nosso cardápio, fazer pedidos e aproveitar cada mordida.<br>Qualquer dúvida, estamos sempre por aqui!</p>
                    <p style='margin-top:32px;font-size:15px;color:#888;'>Um grande abraço da equipe Paivas Burguers! 😋🍟</p>
                </div>
                """
                send_email(email, "Bem-vindo ao Paivas Burguers!", html)
            except Exception as e:
                print(f"Falha ao enviar e-mail de boas-vindas (Google): {e}")
        # Gera JWT
        access_token = jwt.encode({
            "sub": usuario.email,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }, SECRET_KEY, algorithm=ALGORITHM)
        # Retorna também dados do usuário para o callback
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": usuario.email,
                "nome": usuario.nome,
                "aceite_termos": usuario.aceite_termos
            }
        }
    finally:
        db.close()

