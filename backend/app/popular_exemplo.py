from app.db import SessionLocal
from app.models.produto import Produto, TamanhoProduto

def popular_banco():
    db = SessionLocal()
    categorias = [
        ("Lanches Individuais", "X-Salada", "Lanche clássico com alface, tomate e queijo", "x-salada.jpg", [dict(nome="Único", preco=15.0)]),
        # X-Burger terá o tamanho Médio em promoção (preco < preco_original)
        ("Lanches", "X-Burger", "Pão, hambúrguer, queijo, molho especial", "x-burger.jpg", [
            dict(nome="Médio", preco=15.0, preco_original=18.0),  # promoção automática
            dict(nome="Grande", preco=22.0, preco_original=22.0)
        ]),
        ("Combos", "Combo Família", "Combo com 2 lanches, 2 batatas e 2 refrigerantes", "combo-familia.jpg", [dict(nome="Único", preco=49.9)]),
        ("Lanches na Baguete", "Baguete Frango", "Baguete com frango desfiado e queijo", "baguete-frango.jpg", [dict(nome="Único", preco=21.0)]),
        ("Burgers Artesanais", "Artesanal Bacon", "Burger artesanal com bacon crocante", "artesanal-bacon.jpg", [dict(nome="Único", preco=27.0)]),
        ("Porções", "Batata Frita", "Porção de batata frita crocante", "batata-frita.jpg", [dict(nome="Médio", preco=14.0), dict(nome="Grande", preco=19.0)]),
        ("Bebidas", "Refrigerante Lata", "Refrigerante 350ml", "refri-lata.jpg", [dict(nome="Único", preco=6.0)])
    ]
    for cat, nome, desc, img, tamanhos in categorias:
        prod = Produto(
            nome=nome,
            descricao=desc,
            categoria=cat,
            imagem=img,
            disponivel=True
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        for t in tamanhos:
            preco = t["preco"]
            preco_original = t.get("preco_original", preco)
            tamanho = TamanhoProduto(
                produto_id=prod.id,
                nome=t["nome"],
                preco=preco,
                preco_original=preco_original
            )
            db.add(tamanho)
        db.commit()
    db.close()
    print("Banco populado com exemplos!")

if __name__ == "__main__":
    popular_banco()
