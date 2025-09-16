# Script para criar as tabelas do banco de dados do zero
from app.db import engine, Base
from app.models.produto import Produto, TamanhoProduto

if __name__ == "__main__":
    print("Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso!")
