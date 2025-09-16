
# ================================
# Serviço de regras de negócio para pedidos
# Funções utilitárias para criação, atualização, listagem e cancelamento de pedidos.
# ================================

from sqlalchemy.orm import Session
from app.models.pedido import Pedido
from typing import List, Optional

def listar_pedidos_usuario(
    db: Session,
    usuario_id: int,
    status: Optional[str] = None,
    pedido_id: Optional[int] = None
) -> List[Pedido]:
    query = db.query(Pedido).filter(Pedido.cliente_id == usuario_id)
    if status and status != 'todos':
        query = query.filter(Pedido.status == status)
    if pedido_id:
        query = query.filter(Pedido.id == pedido_id)
    return query.order_by(Pedido.id.desc()).all()
