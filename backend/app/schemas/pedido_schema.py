"""
Schema Pydantic para validação de dados de Pedido.
"""
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.adicional_schema import AdicionalSchema

# ================================
# Schema Pydantic para validação de dados de Pedido
# Utilizado para validação de entrada e resposta de dados nas rotas e serviços.
# ================================
from pydantic import BaseModel
from typing import List, Optional

class PedidoItemSchema(BaseModel):
    produto_id: int
    nome: str
    quantidade: int
    preco: float
    adicionais: Optional[List[AdicionalSchema]] = []
    observacoes: Optional[str] = None

class PedidoSchema(BaseModel):
    id: Optional[int] = None
    cliente: Optional[str] = None  # Nome do cliente
    cliente_id: Optional[int] = None
    status: Optional[str] = None
    itens: Optional[List[PedidoItemSchema]] = None  # Lista de itens do pedido
    observacoes: Optional[str] = None
    forma_pagamento: Optional[str] = None
    tipo_entrega: Optional[str] = None  # retirada ou entrega
    bairro: Optional[str] = None
    taxa_entrega: Optional[float] = None
    valor_entrega: Optional[float] = None
    desconto: Optional[float] = None
    troco: Optional[str] = None  # Valor do troco (opcional)
    endereco: Optional[str] = None
    total: Optional[float] = None
    created_at: Optional[str] = None
    data: Optional[str] = None
    data_pedido: Optional[str] = None
