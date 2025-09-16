
# ================================
# Modelo de dados do usuário (tabela usuarios)
# Representa clientes e administradores do sistema.
# ================================
from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base

from sqlalchemy import DateTime
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)  # ID único do usuário
    nome = Column(String, nullable=False)  # Nome completo
    email = Column(String, unique=True, index=True, nullable=False)  # E-mail único
    telefone = Column(String, nullable=True)  # Telefone (WhatsApp)
    rua = Column(String, nullable=True)  # Endereço: rua/avenida
    numero = Column(String, nullable=True)  # Endereço: número
    complemento = Column(String, nullable=True)  # Endereço: complemento
    bairro = Column(String, nullable=True)  # Endereço: bairro
    cidade = Column(String, nullable=True)  # Endereço: cidade
    cep = Column(String, nullable=True)  # Endereço: CEP
    senha_hash = Column(String, nullable=True)  # Senha criptografada
    aceite_termos = Column(Boolean, default=True)  # Aceite dos termos de uso
    role = Column(String, default="cliente")  # Perfil: cliente ou admin
    ativo = Column(Boolean, default=True)  # Usuário ativo (pode acessar o sistema)
    avatar_url = Column(String, nullable=True)  # Caminho do avatar
    created_at = Column(DateTime, default=datetime.utcnow)  # Data de cadastro
    fcm_token = Column(String, nullable=True)  # Token FCM para notificações push
    # Lista de refresh tokens ativos: cada item é um dict {token, expira_em}
    refresh_tokens = Column(String, nullable=True)  # Armazena JSON string com lista de tokens
