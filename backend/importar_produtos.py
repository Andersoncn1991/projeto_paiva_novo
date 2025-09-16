import csv
from app.db import SessionLocal
from app.services.produto_service import criar_produto

# Caminho do CSV exportado
CSV_PATH = "c:/Projeto_paiva_novo/produto.csv"
# Pasta onde as imagens já estão salvas (ajuste se necessário)
IMAGEM_PASTA = "/static/img/"

def importar_produtos():
    db = SessionLocal()
    with open(CSV_PATH, encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            produto_dict = {
                "nome": row["nome"],
                "descricao": row["descricao"],
                "preco": float(row["preco"]) if row["preco"] else None,
                "categoria": row["categoria"],
                "imagem": row["imagem"],
                "preco_media": float(row["preco_media"]) if row["preco_media"] else None,
                "preco_grande": float(row["preco_grande"]) if row["preco_grande"] else None,
            }
            criar_produto(db, produto_dict)
    db.close()

if __name__ == "__main__":
    importar_produtos()
    print("Importação de produtos finalizada!")
