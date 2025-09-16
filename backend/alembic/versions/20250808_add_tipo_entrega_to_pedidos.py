"""
add tipo_entrega field to pedidos table

Revision ID: 20250808_add_tipo_entrega_to_pedidos
Revises: 20250808_add_forma_pagamento_to_pedidos
Create Date: 2025-08-08
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250808_add_tipo_entrega_to_pedidos'
down_revision = '20250808_add_forma_pagamento_to_pedidos'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('pedidos', sa.Column('tipo_entrega', sa.String(length=50), nullable=True))

def downgrade():
    op.drop_column('pedidos', 'tipo_entrega')
