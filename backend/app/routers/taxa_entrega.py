def levenshtein(a: str, b: str) -> int:
    # Calcula a distância de Levenshtein entre duas strings
    if a == b:
        return 0
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)
    v0 = [i for i in range(len(b) + 1)]
    v1 = [0] * (len(b) + 1)
    for i in range(len(a)):
        v1[0] = i + 1
        for j in range(len(b)):
            cost = 0 if a[i] == b[j] else 1
            v1[j + 1] = min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost)
        v0, v1 = v1, v0
    return v0[len(b)]

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.taxa_entrega import TaxaEntrega
import unicodedata

router = APIRouter(prefix="/api/taxa-entrega", tags=["TaxaEntrega"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função para normalizar bairro (remove acentos, caixa baixa, espaços extras)
def normalizar_bairro(bairro: str) -> str:
    if not bairro:
        return ''
    import re
    bairro = unicodedata.normalize('NFD', bairro)
    bairro = ''.join(c for c in bairro if unicodedata.category(c) != 'Mn')
    bairro = bairro.lower()
    bairro = re.sub(r'\s+', ' ', bairro) # espaços múltiplos para um só
    bairro = bairro.strip()
    return bairro

@router.get("")
def get_taxa_entrega(bairro: str = Query(...), db: Session = Depends(get_db)):
    bairro_normalizado = normalizar_bairro(bairro)
    taxas = db.query(TaxaEntrega).all()
    # Busca exata primeiro
    for taxa in taxas:
        if normalizar_bairro(taxa.bairro) == bairro_normalizado:
            return {"bairro": taxa.bairro, "valor": taxa.valor}
    # Busca aproximada (fuzzy search)
    melhor_taxa = None
    melhor_distancia = 999
    for taxa in taxas:
        distancia = levenshtein(normalizar_bairro(taxa.bairro), bairro_normalizado)
        if distancia < melhor_distancia:
            melhor_distancia = distancia
            melhor_taxa = taxa
    # Se a distância for pequena (até 2 letras de diferença), considera como match
    if melhor_taxa and melhor_distancia <= 2:
        return {"bairro": melhor_taxa.bairro, "valor": melhor_taxa.valor}
    raise HTTPException(status_code=404, detail="Taxa não encontrada")
