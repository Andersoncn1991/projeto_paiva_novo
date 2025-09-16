"""Garante que todos os campos id das tabelas principais sejam autoincremento (SERIAL) no PostgreSQL"""

from alembic import op
import sqlalchemy as sa

revision = '20250827_auto_increment_all_ids'
down_revision = '20250816_multi_refresh_tokens'
branch_labels = None
depends_on = None

def upgrade():
    # Clientes
    op.execute("CREATE SEQUENCE IF NOT EXISTS clientes_id_seq;")
    op.execute("ALTER TABLE clientes ALTER COLUMN id SET DEFAULT nextval('clientes_id_seq');")
    # Produtos
    op.execute("CREATE SEQUENCE IF NOT EXISTS produtos_id_seq;")
    op.execute("ALTER TABLE produtos ALTER COLUMN id SET DEFAULT nextval('produtos_id_seq');")
    # Tamanhos Produto
    op.execute("CREATE SEQUENCE IF NOT EXISTS tamanhos_produto_id_seq;")
    op.execute("ALTER TABLE tamanhos_produto ALTER COLUMN id SET DEFAULT nextval('tamanhos_produto_id_seq');")
    # Adicionais
    op.execute("CREATE SEQUENCE IF NOT EXISTS adicionais_id_seq;")
    op.execute("ALTER TABLE adicionais ALTER COLUMN id SET DEFAULT nextval('adicionais_id_seq');")
    # Pedidos
    op.execute("CREATE SEQUENCE IF NOT EXISTS pedidos_id_seq;")
    op.execute("ALTER TABLE pedidos ALTER COLUMN id SET DEFAULT nextval('pedidos_id_seq');")
    # Usuarios
    op.execute("CREATE SEQUENCE IF NOT EXISTS usuarios_id_seq;")
    op.execute("ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT nextval('usuarios_id_seq');")
    # Taxa Entrega
    op.execute("CREATE SEQUENCE IF NOT EXISTS taxa_entrega_id_seq;")
    op.execute("ALTER TABLE taxa_entrega ALTER COLUMN id SET DEFAULT nextval('taxa_entrega_id_seq');")

def downgrade():
    op.execute("ALTER TABLE clientes ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS clientes_id_seq;")
    op.execute("ALTER TABLE produtos ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS produtos_id_seq;")
    op.execute("ALTER TABLE tamanhos_produto ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS tamanhos_produto_id_seq;")
    op.execute("ALTER TABLE adicionais ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS adicionais_id_seq;")
    op.execute("ALTER TABLE pedidos ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS pedidos_id_seq;")
    op.execute("ALTER TABLE usuarios ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS usuarios_id_seq;")
    op.execute("ALTER TABLE taxa_entrega ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE IF EXISTS taxa_entrega_id_seq;")
