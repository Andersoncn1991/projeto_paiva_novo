"""
add observacoes field to pedidos table

Revision ID: 20250806_add_observacoes_to_pedidos
Revises: 20250805_add_avatar_url_and_created_at
Create Date: 2025-08-06 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250806_add_observacoes_to_pedidos'
down_revision = '20250805_add_avatar_url_and_created_at'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('pedidos', sa.Column('observacoes', sa.String(length=500), nullable=True))

def downgrade():
    op.drop_column('pedidos', 'observacoes')
