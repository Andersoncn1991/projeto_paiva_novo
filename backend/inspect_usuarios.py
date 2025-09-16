import sqlite3, os, json

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'db.sqlite3'))
print('Using DB:', DB_PATH)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print('\n-- PRAGMA table_info(usuarios) --')
cur.execute('PRAGMA table_info(usuarios)')
for col in cur.fetchall():
    print(col)

print('\n-- SAMPLE ROWS (id,nome,telefone,rua,numero,complemento,bairro,cidade,cep) --')
cur.execute('SELECT id,nome,telefone,rua,numero,complemento,bairro,cidade,cep FROM usuarios LIMIT 20')
rows = cur.fetchall()
for r in rows:
    print(r)

print(f'\nTotal rows: {len(rows)} (limited)')

conn.close()
