from pydantic import BaseModel
from typing import Optional


class ProdutoSchema(BaseModel):
    id: Optional[int]
    nome: str
    descricao: str
    categoria: Optional[str]
    imagem: Optional[str]
    disponivel: Optional[bool] = True
    maisVendido: Optional[bool] = False
    novidade: Optional[bool] = False
    tamanhos: list

    class Config:
        from_attributes = True
