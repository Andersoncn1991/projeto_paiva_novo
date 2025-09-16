from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.produto import Produto
from app.schemas.produto_schema import ProdutoSchema
from typing import List, Optional
from app.services.produto_service import criar_produto, atualizar_produto
from pydantic import BaseModel


router = APIRouter(prefix="/api/produtos", tags=["produtos"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[ProdutoSchema])
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(Produto).all()
    resultado = []
    for prod in produtos:
        tamanhos = []
        # Lógica para cada tamanho: se preço atual < preço original, está em promoção
        if hasattr(prod, 'tamanhos') and prod.tamanhos:
            for t in prod.tamanhos:
                preco_original = t.preco_original if t.preco_original is not None else t.preco
                preco_media_original = t.preco_media_original if t.preco_media_original is not None else t.preco_media
                preco_grande_original = t.preco_grande_original if t.preco_grande_original is not None else t.preco_grande
                # Ajusta precoPromocional para o frontend reconhecer promoção de Médio/Grande
                preco_promocional = None
                if t.preco_media_promocional is not None:
                    preco_promocional = t.preco_media_promocional
                elif t.preco_grande_promocional is not None:
                    preco_promocional = t.preco_grande_promocional
                elif t.precoPromocional is not None:
                    preco_promocional = t.precoPromocional
                tamanhos.append({
                    'nome': t.nome,
                    'preco': t.preco,
                    'preco_original': preco_original,
                    'preco_media': t.preco_media,
                    'preco_media_original': preco_media_original,
                    'preco_grande': t.preco_grande,
                    'preco_grande_original': preco_grande_original,
                    'preco_media_promocional': t.preco_media_promocional,
                    'preco_grande_promocional': t.preco_grande_promocional,
                    'precoPromocional': preco_promocional,
                    'emPromocao': (
                        (preco_promocional is not None and preco_original is not None and preco_promocional < preco_original)
                        or (t.preco_media_promocional is not None and preco_media_original is not None and t.preco_media_promocional < preco_media_original)
                        or (t.preco_grande_promocional is not None and preco_grande_original is not None and t.preco_grande_promocional < preco_grande_original)
                    )
                })
        else:
            preco_original = prod.preco_original if hasattr(prod, 'preco_original') and prod.preco_original is not None else prod.preco
            tamanhos.append({
                'nome': 'Único',
                'preco': prod.preco,
                'preco_original': preco_original,
                'precoPromocional': prod.precoPromocional if hasattr(prod, 'precoPromocional') else None,
                'emPromocao': (hasattr(prod, 'precoPromocional') and prod.precoPromocional is not None and preco_original is not None and prod.precoPromocional < preco_original)
            })
        resultado.append({
            'id': prod.id,
            'nome': prod.nome,
            'descricao': prod.descricao,
            'categoria': prod.categoria,
            'imagem': prod.imagem,
            'disponivel': bool(getattr(prod, 'disponivel', True)),
            'maisVendido': getattr(prod, 'maisVendido', False),
            'novidade': getattr(prod, 'novidade', False),
            'tamanhos': tamanhos
        })
    return resultado

@router.get("/mais-vendidos", response_model=List[ProdutoSchema])
def listar_mais_vendidos(limit: int = 4, db: Session = Depends(get_db)):
    produtos = db.query(Produto).filter(Produto.maisVendido == True).limit(limit).all()
    resultado = []
    for prod in produtos:
        tamanhos = []
        if hasattr(prod, 'tamanhos') and prod.tamanhos:
            for t in prod.tamanhos:
                tamanhos.append({
                    'nome': t.nome,
                    'preco': t.preco,
                    'precoPromocional': getattr(t, 'precoPromocional', None)
                })
        resultado.append({
            'id': prod.id,
            'nome': prod.nome,
            'descricao': prod.descricao,
            'categoria': prod.categoria,
            'imagem': prod.imagem,
            'disponivel': bool(getattr(prod, 'disponivel', True)),
            'maisVendido': getattr(prod, 'maisVendido', False),
            'novidade': getattr(prod, 'novidade', False),
            'tamanhos': tamanhos
        })
    return resultado


class ProdutoCreateSchema(BaseModel):
    nome: str
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    imagem: Optional[str] = None
    disponivel: Optional[bool] = True
    tamanhos: Optional[List[dict]] = None

class ProdutoUpdateSchema(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    imagem: Optional[str] = None
    disponivel: Optional[bool] = None
    tamanhos: Optional[List[dict]] = None

@router.post("/", response_model=ProdutoSchema)
def criar_produto_endpoint(produto: ProdutoCreateSchema, db: Session = Depends(lambda: SessionLocal())):
    # Cria produto e tamanhos
    novo_produto = Produto(
        nome=produto.nome,
        descricao=produto.descricao,
        categoria=produto.categoria,
        imagem=produto.imagem,
        disponivel=produto.disponivel
    )
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    # Adiciona tamanhos se houver
    if produto.tamanhos:
        for t in produto.tamanhos:
            tamanho = novo_produto.tamanhos.property.mapper.class_(
                nome=t.get('nome'),
                preco=t.get('preco'),
                preco_original=t.get('preco'),
                preco_media=t.get('preco_media'),
                preco_media_original=t.get('preco_media'),
                preco_grande=t.get('preco_grande'),
                preco_grande_original=t.get('preco_grande'),
            )
            novo_produto.tamanhos.append(tamanho)
        db.commit()
    db.refresh(novo_produto)
    return novo_produto

@router.patch("/{produto_id}")
def patch_produto(produto_id: int, update: ProdutoUpdateSchema, db: Session = Depends(lambda: SessionLocal())):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    # Atualiza campos simples
    for key, value in update.dict(exclude_unset=True).items():
        if key != 'tamanhos':
            setattr(produto, key, value)
    # Atualiza tamanhos e lógica de promoção
    if update.tamanhos:
        for t_update in update.tamanhos:
            t_nome = t_update.get('nome')
            t_obj = next((t for t in produto.tamanhos if t.nome == t_nome), None)
            if t_obj:
                # Atualiza preços e promoções
                if 'preco' in t_update:
                    if t_obj.preco_original is None:
                        t_obj.preco_original = t_obj.preco
                    if t_update['preco'] < (t_obj.preco_original or t_obj.preco):
                        t_obj.precoPromocional = t_update['preco']
                    else:
                        t_obj.precoPromocional = None
                    t_obj.preco = t_update['preco']
                if 'preco_media' in t_update:
                    if t_obj.preco_media_original is None:
                        t_obj.preco_media_original = t_obj.preco_media
                    if t_update['preco_media'] < (t_obj.preco_media_original or t_obj.preco_media):
                        t_obj.preco_media_promocional = t_update['preco_media']
                    else:
                        t_obj.preco_media_promocional = None
                    t_obj.preco_media = t_update['preco_media']
                if 'preco_grande' in t_update:
                    if t_obj.preco_grande_original is None:
                        t_obj.preco_grande_original = t_obj.preco_grande
                    if t_update['preco_grande'] < (t_obj.preco_grande_original or t_obj.preco_grande):
                        t_obj.preco_grande_promocional = t_update['preco_grande']
                    else:
                        t_obj.preco_grande_promocional = None
                    t_obj.preco_grande = t_update['preco_grande']
    db.commit()
    db.refresh(produto)
    return {"success": True}
