"""
add bairro field to pedidos table

Revision ID: 20250808_add_bairro_to_pedidos
Revises: 20250808_add_tipo_entrega_to_pedidos
Create Date: 2025-08-08
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250808_add_bairro_to_pedidos'
down_revision = '20250808_add_tipo_entrega_to_pedidos'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('pedidos', sa.Column('bairro', sa.String(length=100), nullable=True))

def downgrade():
    op.drop_column('pedidos', 'bairro')
