from pydantic import BaseModel
from typing import Optional

class AdicionalSchema(BaseModel):
    id: Optional[int]
    nome: str
    preco: Optional[float]
    quantidade: Optional[int] = 1
    valor_total: Optional[float] = None

    class Config:
        from_attributes = True
