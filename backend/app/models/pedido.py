
# ================================
# Modelo de dados para Pedido (Pydantic)
# Utilizado para validação, criação e resposta de dados de pedidos.
# ================================
from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy import Text
from sqlalchemy.orm import relationship
from app.db import Base

class Pedido(Base):
    __tablename__ = 'pedidos'
    id = Column(Integer, primary_key=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey('clientes.id'))
    status = Column(String(50), nullable=False)
    itens = Column(Text, nullable=True)  # Pode ser JSON/texto serializado
    observacoes = Column(String(500), nullable=True)
    forma_pagamento = Column(String(50), nullable=True)
    tipo_entrega = Column(String(30), nullable=True)  # retirada ou entrega
    bairro = Column(String(100), nullable=True)
    taxa_entrega = Column(Float, nullable=True)
    cliente = relationship('Cliente')
    created_at = Column(String(30), nullable=True)  # ISO datetime string
    troco = Column(String(30), nullable=True)  # Valor do troco (opcional)
    endereco = Column(String(255), nullable=True)  # Endereço completo do cliente para entrega
