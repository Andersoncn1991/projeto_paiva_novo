
# ================================
# Modelo de dados para Cliente (Pydantic)
# Utilizado para validação, criação e resposta de dados de clientes.
# ================================
from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base

class Cliente(Base):
    __tablename__ = 'clientes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    telefone = Column(String(20), nullable=True)
    rua = Column(String(100), nullable=True)
    numero = Column(String(20), nullable=True)
    complemento = Column(String(100), nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=True)
    cep = Column(String(20), nullable=True)
    senha_hash = Column(String(255), nullable=False)
    aceite_termos = Column(Boolean, default=False)
    role = Column(String(20), default='cliente')
    ativo = Column(Boolean, default=False)
