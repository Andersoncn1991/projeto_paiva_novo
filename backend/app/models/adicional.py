from sqlalchemy import Column, Integer, String, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

# Tabela associativa produto <-> adicional (muitos para muitos)
produto_adicional = Table(
    'produto_adicional', Base.metadata,
    Column('produto_id', Integer, ForeignKey('produtos.id'), primary_key=True),
    Column('adicional_id', Integer, ForeignKey('adicionais.id'), primary_key=True)
)

class Adicional(Base):
    __tablename__ = 'adicionais'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    preco = Column(Float, nullable=True)
    produtos = relationship('app.models.produto.Produto', secondary=produto_adicional, back_populates='adicionais')
