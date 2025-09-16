import csv
from app.db import SessionLocal
from app.models.taxa_entrega import TaxaEntrega

# Caminho do arquivo CSV
csv_path = 'taxa.csv'

def importar_taxas():
    db = SessionLocal()
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            bairro = row.get('bairro') or row.get('Bairro') or row.get('descricao') or row.get('Descrição')
            valor = row.get('valor') or row.get('Valor') or row.get('taxa') or row.get('Taxa')
            if not bairro or not valor:
                print(f"Ignorando linha: {row}")
                continue
            try:
                valor_float = float(valor.replace(',', '.'))
            except Exception:
                print(f"Valor inválido para bairro {bairro}: {valor}")
                continue
            existe = db.query(TaxaEntrega).filter(TaxaEntrega.bairro == bairro).first()
            if not existe:
                taxa = TaxaEntrega(bairro=bairro, valor=valor_float)
                db.add(taxa)
                print(f"Inserido: {bairro} - R$ {valor_float}")
            else:
                print(f"Já existe: {bairro}")
        db.commit()
    print('Importação concluída.')

if __name__ == '__main__':
    importar_taxas()