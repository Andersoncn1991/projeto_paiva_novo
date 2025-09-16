# ================================
# Rotas relacionadas a pedidos (criação, listagem, atualização de status, etc)
# ================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import SessionLocal
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from app.routers.auth import get_current_user
from app.services.pedido_service import listar_pedidos_usuario
from app.models.pedido import Pedido
from app.models.cliente import Cliente
from typing import Optional
from app.schemas.pedido_schema import PedidoSchema
from datetime import datetime
import json

# Instância do APIRouter para rotas de pedidos
router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.get("/", summary="Lista os pedidos do usuário autenticado", tags=["Pedidos"])
def listar_pedidos(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    pedido_id: Optional[int] = Query(None, description="Buscar por número/id do pedido"),
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user)
):
    """
    Retorna os pedidos do usuário autenticado, com todos os campos necessários para o frontend.
    Suporta filtro por status e por número/id do pedido.
    """
    print(f"[DEBUG] /pedidos/ - usuario: email={getattr(usuario, 'email', None)}, role={getattr(usuario, 'role', None)}")
    # Se admin, retorna todos os pedidos (independente de cliente vinculado)
    if hasattr(usuario, 'role') and usuario.role == 'admin':
        from app.models.pedido import Pedido
        query = db.query(Pedido)
        if status and status != 'todos':
            query = query.filter(Pedido.status == status)
        if pedido_id:
            query = query.filter(Pedido.id == pedido_id)
        pedidos = query.order_by(Pedido.id.desc()).all()
    else:
        # Busca o cliente pelo email do usuário
        cliente = db.query(Cliente).filter(Cliente.email == usuario.email).first()
        if not cliente:
            # Se não encontrar cliente, retorna lista vazia (evita erro 401)
            pedidos = []
        else:
            cliente_id = int(getattr(cliente, 'id', 0))
            pedidos = listar_pedidos_usuario(db, cliente_id, status, pedido_id)
    resultado = []
    for pedido in pedidos:
        # Itens pode estar serializado como string JSON, tratar para lista
        try:
            itens_raw = getattr(pedido, 'itens', None)
            if isinstance(itens_raw, str):
                itens = json.loads(itens_raw) if len(itens_raw) > 0 else []
            else:
                itens = []
        except Exception:
            itens = []
        resultado.append({
            "id": pedido.id,
            "status": pedido.status,
            "data": getattr(pedido, 'data', None),
            "created_at": getattr(pedido, 'created_at', None),
            "data_pedido": getattr(pedido, 'data_pedido', None),
            "itens": itens,
            "total": getattr(pedido, 'total', None),
            "valor_entrega": getattr(pedido, 'valor_entrega', None),
            "taxa_entrega": getattr(pedido, 'taxa_entrega', None),
            "desconto": getattr(pedido, 'desconto', None),
            "endereco": getattr(pedido, 'endereco', None),
            "forma_pagamento": getattr(pedido, 'forma_pagamento', None),
            "observacoes": pedido.observacoes,
        })
    return resultado


@router.post("/", summary="Cria um novo pedido", tags=["Pedidos"])
def criar_pedido(pedido: PedidoSchema, db: Session = Depends(get_db), usuario=Depends(get_current_user)):
    # Serializa os itens (com adicionais) para string JSON
    # Adiciona valor_total em cada adicional antes de serializar
    itens_com_valor_total = []
    for item in (pedido.itens or []):
        item_dict = item.dict()
        if item_dict.get('adicionais'):
            for adc in item_dict['adicionais']:
                qtd = adc.get('quantidade', 1)
                preco = adc.get('preco', 0)
                adc['valor_total'] = round(qtd * preco, 2)
        itens_com_valor_total.append(item_dict)
    itens_json = json.dumps(itens_com_valor_total, ensure_ascii=False)
    # Lógica: retirada nunca tem taxa, entrega sempre tem (mesmo que zero)
    tipo_entrega = (pedido.tipo_entrega or '').strip().lower()
    taxa_entrega = pedido.taxa_entrega
    # Se for retirada, nunca tem taxa
    if tipo_entrega == 'retirada' or tipo_entrega == 'balcao' or tipo_entrega == 'balcão':
        taxa_entrega = 0.0
    # Se for entrega, busca taxa pelo bairro; se não encontrar, atribui 20
    elif tipo_entrega == 'entrega':
        taxa_entrega = taxa_entrega if taxa_entrega is not None else 0.0
        if taxa_entrega == 0.0:
            # Busca taxa pelo bairro
            from app.models.taxa_entrega import TaxaEntrega
            from sqlalchemy.orm import Session
            import unicodedata, re
            def normalizar_bairro(bairro: str) -> str:
                if not bairro:
                    return ''
                bairro = unicodedata.normalize('NFD', bairro)
                bairro = ''.join(c for c in bairro if unicodedata.category(c) != 'Mn')
                bairro = bairro.lower()
                bairro = re.sub(r'\s+', ' ', bairro)
                bairro = bairro.strip()
                return bairro
            bairro_normalizado = normalizar_bairro(pedido.bairro or '')
            taxa_obj = db.query(TaxaEntrega).filter(TaxaEntrega.bairro.ilike(f"%{bairro_normalizado}%")).first()
            if taxa_obj:
                taxa_entrega = taxa_obj.valor
            else:
                taxa_entrega = 20.0
    # Busca o cliente pelo email do usuário
    # Busca SEMPRE na tabela clientes, nunca em usuarios
    from app.models.usuario import Usuario
    usuario_db = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    cliente_id = None
    if usuario_db:
        cliente_id = getattr(usuario_db, 'id', None)
    # Monta endereço completo do usuário para pedidos de entrega
    endereco_pedido = None
    if tipo_entrega == 'entrega' and usuario_db:
        rua = str(getattr(usuario_db, 'rua', '') or '').strip()
        numero = str(getattr(usuario_db, 'numero', '') or '').strip()
        complemento = str(getattr(usuario_db, 'complemento', '') or '').strip()
        bairro = str(getattr(usuario_db, 'bairro', '') or '').strip()
        cidade = str(getattr(usuario_db, 'cidade', '') or '').strip()
        uf = str(getattr(usuario_db, 'uf', '') or '').strip()
        cep = str(getattr(usuario_db, 'cep', '') or '').strip()
        endereco_pedido = f"{rua}{', ' if rua and numero else ''}{numero}{', ' if bairro else ''}{bairro}{', ' if cidade else ''}{cidade}{' - ' if cep else ''}{cep}".replace(' ,', ',').replace(' ,', ',').strip(', ').strip()
        print(f"[PEDIDO] tipo_entrega: {tipo_entrega}")
        print(f"[PEDIDO] usuario: {usuario_db.nome}, email: {usuario_db.email}")
        print(f"[PEDIDO] Endereço montado: {endereco_pedido}")

    novo_pedido = Pedido(
        cliente_id=cliente_id,
        status="novo",
        itens=itens_json,
        observacoes=pedido.observacoes,
        forma_pagamento=pedido.forma_pagamento,
        tipo_entrega=pedido.tipo_entrega,
        bairro=pedido.bairro,
        taxa_entrega=taxa_entrega,
        troco=pedido.troco if pedido.troco else None,
        endereco=endereco_pedido,
        created_at=datetime.now().isoformat()
    )
    db.add(novo_pedido)
    db.commit()
    db.refresh(novo_pedido)
    return {
        "id": novo_pedido.id,
        "status": novo_pedido.status,
        "observacoes": novo_pedido.observacoes,
        "forma_pagamento": novo_pedido.forma_pagamento,
        "tipo_entrega": novo_pedido.tipo_entrega,
        "bairro": novo_pedido.bairro,
        "taxa_entrega": novo_pedido.taxa_entrega
    }
