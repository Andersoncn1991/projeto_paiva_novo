from sqlalchemy import Column, Integer, String, Float
from ..db import Base

class TaxaEntrega(Base):
    __tablename__ = 'taxa_entrega'
    id = Column(Integer, primary_key=True, index=True)
    bairro = Column(String(100), unique=True, nullable=False)
    valor = Column(Float, nullable=False)
