import csv
from app.db import SessionLocal
from app.models.adicional import Adicional

def importar_adicionais_csv(caminho_csv):
    session = SessionLocal()
    with open(caminho_csv, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nome = row['nome'].strip()
            preco = float(row['preco']) if row['preco'] else None
            adicional = Adicional(nome=nome, preco=preco)
            session.add(adicional)
        session.commit()
    session.close()

if __name__ == '__main__':
    importar_adicionais_csv('adicional.csv')
