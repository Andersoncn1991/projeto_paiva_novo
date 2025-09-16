from app.models.produto import Produto
from app.db import SessionLocal
def criar_produto(db, produto_dict):
    produto = Produto(**produto_dict)
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto

def atualizar_produto(db, produto_id, update_dict):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        return None
    for key, value in update_dict.items():
        setattr(produto, key, value)
    db.commit()
    db.refresh(produto)
    return produto
