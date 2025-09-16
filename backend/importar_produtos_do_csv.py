import csv
from app.db import SessionLocal
from app.models.produto import Produto, TamanhoProduto

# Mapeamento das categorias do CSV para o sistema atual
CATEGORIA_MAP = {
    "lanches_individuais": "Lanches Individuais",
    "lanches": "Lanches",
    "baguete": "Lanches na Baguete",
    "burgers": "Burgers Artesanais",
    "combos": "Combos",
    "porcoes": "Porções",
    "bebidas": "Bebidas"
}

ARQUIVO_CSV = "csv.csv"  # Caminho do arquivo CSV

def parse_float(valor):
    try:
        return float(valor.replace(",", ".")) if valor else None
    except Exception:
        return None

def main():
    session = SessionLocal()
    with open(ARQUIVO_CSV, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            categoria = CATEGORIA_MAP.get(row["categoria"].strip(), row["categoria"].strip())
            nome = row["nome"].strip()
            descricao = row["descricao"].strip() if row["descricao"] else ""
            preco = parse_float(row["preco"])
            preco_media = parse_float(row["preco_media"])
            preco_grande = parse_float(row["preco_grande"])

            # Verifica se produto já existe (opcional, pode remover se quiser duplicar)
            existe = session.query(Produto).filter_by(nome=nome, categoria=categoria).first()
            if existe:
                print(f"Produto já existe: {nome} ({categoria}) - pulando...")
                continue

            produto = Produto(
                nome=nome,
                descricao=descricao,
                categoria=categoria,
                imagem=None,
                disponivel=True
            )
            session.add(produto)
            session.flush()  # Para obter o ID

            tamanhos = []
            if categoria in ["Lanches", "Porções"]:
                if preco_media:
                    tamanhos.append(TamanhoProduto(
                        produto_id=produto.id,
                        nome="Médio",
                        preco=preco_media,
                        preco_original=preco_media
                    ))
                if preco_grande:
                    tamanhos.append(TamanhoProduto(
                        produto_id=produto.id,
                        nome="Grande",
                        preco=preco_grande,
                        preco_original=preco_grande
                    ))
                if not preco_media and not preco_grande and preco:
                    tamanhos.append(TamanhoProduto(
                        produto_id=produto.id,
                        nome="Único",
                        preco=preco,
                        preco_original=preco
                    ))
            else:
                if preco:
                    tamanhos.append(TamanhoProduto(
                        produto_id=produto.id,
                        nome="Único",
                        preco=preco,
                        preco_original=preco
                    ))
            session.add_all(tamanhos)
        session.commit()
    print("Importação concluída!")

if __name__ == "__main__":
    main()
