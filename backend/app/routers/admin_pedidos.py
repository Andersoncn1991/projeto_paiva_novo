from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.routers.auth import get_current_user
from app.models.pedido import Pedido
from app.models.cliente import Cliente
from app.schemas.pedido_schema import PedidoSchema
from typing import List, Optional
import json

router = APIRouter(prefix="/admin/pedidos", tags=["AdminPedidos"])

# ...existing code...

# ================================
# Rotas de administração de pedidos
# ================================

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.routers.auth import get_current_user
from app.models.pedido import Pedido
from app.models.cliente import Cliente
from app.schemas.pedido_schema import PedidoSchema
from typing import List, Optional
import json

router = APIRouter(prefix="/admin/pedidos", tags=["AdminPedidos"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/total", summary="Retornar valor total de todos os pedidos")
def total_geral_pedidos(db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    if not hasattr(usuario, 'role') or usuario.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito ao admin")
    pedidos = db.query(Pedido).all()
    total_geral = 0
    for pedido in pedidos:
        try:
            itens_raw = getattr(pedido, 'itens', None)
            if isinstance(itens_raw, str):
                itens = json.loads(itens_raw) if len(itens_raw) > 0 else []
            else:
                itens = []
        except Exception:
            itens = []
        taxa = getattr(pedido, 'taxa_entrega', None)
        if taxa is None:
            taxa = getattr(pedido, 'valor_entrega', 0)
        else:
            taxa = float(taxa) if taxa is not None else 0
        desconto = getattr(pedido, 'desconto', 0) or 0
        total_itens = 0
        for item in itens:
            subtotal = (item.get('preco', 0) * item.get('quantidade', 1))
            if 'adicionais' in item and isinstance(item['adicionais'], list):
                for adc in item['adicionais']:
                    if isinstance(adc, dict):
                        if 'valor_total' in adc and isinstance(adc['valor_total'], (int, float)):
                            subtotal += adc['valor_total']
                        else:
                            qtd = adc.get('quantidade', 1)
                            preco = adc.get('preco', 0)
                            subtotal += preco * qtd
            total_itens += subtotal
        tipo_entrega = getattr(pedido, 'tipo_entrega', None) or getattr(pedido, 'tipoEntrega', None)
        is_entrega = False
        if tipo_entrega:
            is_entrega = str(tipo_entrega).lower() == 'entrega'
        elif taxa > 0:
            is_entrega = True
        total = total_itens + (taxa if is_entrega else 0) - desconto
        if total < 0:
            total = 0
        total_geral += total
    return {"total_geral": round(total_geral, 2)}
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[PedidoSchema], summary="Listar todos os pedidos para admin")
def listar_todos_pedidos(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    pedido_id: Optional[int] = Query(None, description="Buscar por número/id do pedido"),
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user)
):
    print(f"[DEBUG] /admin/pedidos/ - usuario: email={getattr(usuario, 'email', None)}, role={getattr(usuario, 'role', None)}")
    if not hasattr(usuario, 'role') or usuario.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito ao admin")
    query = db.query(Pedido)
    if status and status != 'todos':
        query = query.filter(Pedido.status == status)
    if pedido_id:
        query = query.filter(Pedido.id == pedido_id)
    pedidos = query.order_by(Pedido.id.desc()).all()
    resultado = []
    for pedido in pedidos:
        try:
            itens_raw = getattr(pedido, 'itens', None)
            if isinstance(itens_raw, str):
                itens = json.loads(itens_raw) if len(itens_raw) > 0 else []
            else:
                itens = []
        except Exception:
            itens = []
        # Buscar nome do cliente
        cliente_nome = None
        try:
            cliente_obj = db.query(Cliente).filter(Cliente.id == getattr(pedido, 'cliente_id', None)).first()
            if cliente_obj:
                cliente_nome = cliente_obj.nome
        except Exception:
            cliente_nome = None

        # Cálculo do total do pedido
        taxa = getattr(pedido, 'taxa_entrega', None)
        if taxa is None:
            taxa = getattr(pedido, 'valor_entrega', 0)
        else:
            taxa = float(taxa) if taxa is not None else 0
        desconto = getattr(pedido, 'desconto', 0) or 0
        # Soma dos itens e adicionais
        total_itens = 0
        for item in itens:
            subtotal = (item.get('preco', 0) * item.get('quantidade', 1))
            if 'adicionais' in item and isinstance(item['adicionais'], list):
                for adc in item['adicionais']:
                    if isinstance(adc, dict):
                        if 'valor_total' in adc and isinstance(adc['valor_total'], (int, float)):
                            subtotal += adc['valor_total']
                        else:
                            qtd = adc.get('quantidade', 1)
                            preco = adc.get('preco', 0)
                            subtotal += preco * qtd
            total_itens += subtotal
        # Verifica se é entrega para somar taxa
        tipo_entrega = getattr(pedido, 'tipo_entrega', None) or getattr(pedido, 'tipoEntrega', None)
        is_entrega = False
        if tipo_entrega:
            is_entrega = str(tipo_entrega).lower() == 'entrega'
        elif taxa > 0:
            is_entrega = True
        total = total_itens + (taxa if is_entrega else 0) - desconto
        if total < 0:
            total = 0

        # Monta o endereço detalhado para pedidos de entrega
        tipo_entrega_resp = getattr(pedido, 'tipo_entrega', None)
        endereco_resp = getattr(pedido, 'endereco', None)
        if (tipo_entrega_resp and str(tipo_entrega_resp).lower() == 'entrega') and not endereco_resp:
            cliente_obj = db.query(Cliente).filter(Cliente.id == getattr(pedido, 'cliente_id', None)).first()
            if cliente_obj:
                rua = getattr(cliente_obj, 'rua', '') or ''
                numero = getattr(cliente_obj, 'numero', '') or ''
                complemento = getattr(cliente_obj, 'complemento', '') or ''
                bairro = getattr(cliente_obj, 'bairro', '') or ''
                cidade = getattr(cliente_obj, 'cidade', '') or ''
                uf = getattr(cliente_obj, 'uf', '') or ''
                cep = getattr(cliente_obj, 'cep', '') or ''
                endereco_resp = f"{rua}, {numero}{', ' + complemento if complemento else ''}{' - ' + bairro if bairro else ''}{', ' + cidade if cidade else ''}{'/' + uf if uf else ''}{' - CEP: ' + cep if cep else ''}"
                endereco_resp = endereco_resp.strip(', ').strip()

        resultado.append({
            "id": pedido.id,
            "status": pedido.status,
            "data": getattr(pedido, 'data', None),
            "created_at": getattr(pedido, 'created_at', None),
            "data_pedido": getattr(pedido, 'data_pedido', None),
            "itens": itens,
            "total": round(total, 2),
            "valor_entrega": getattr(pedido, 'valor_entrega', None),
            "taxa_entrega": getattr(pedido, 'taxa_entrega', None),
            "desconto": desconto,
            "endereco": endereco_resp,
            "forma_pagamento": getattr(pedido, 'forma_pagamento', None),
            "cliente_id": getattr(pedido, 'cliente_id', None),
            "cliente": cliente_nome,
            "tipo_entrega": getattr(pedido, 'tipo_entrega', None),
        })
    return resultado

# PATCH para alterar status do pedido
@router.patch("/{pedido_id}/status", summary="Alterar status do pedido")
def alterar_status_pedido(
    pedido_id: int,
    novo_status: str = Query(..., description="Novo status"),
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user)
):
    if not hasattr(usuario, 'role') or usuario.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito ao admin")
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = novo_status
    db.commit()
    return {"success": True, "pedido_id": pedido_id, "novo_status": novo_status}

# PATCH para cancelar pedido
@router.patch("/{pedido_id}/cancelar", summary="Cancelar pedido")
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user)
):
    if not hasattr(usuario, 'role') or usuario.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito ao admin")
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    pedido.status = 'cancelado'
    db.commit()
    return {"success": True, "pedido_id": pedido_id, "novo_status": "cancelado"}
