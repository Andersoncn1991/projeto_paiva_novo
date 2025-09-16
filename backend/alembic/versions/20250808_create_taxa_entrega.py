"""
Revision ID: 20250808_create_taxa_entrega
Revises: 20250806_add_observacoes_to_pedidos
Create Date: 2025-08-08
"""

# Alembic identifiers
revision = '20250808_create_taxa_entrega'
down_revision = '20250806_add_observacoes_to_pedidos'
branch_labels = None
depends_on = None
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'taxa_entrega',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('bairro', sa.String(100), nullable=False, unique=True),
        sa.Column('valor', sa.Float, nullable=False)
    )

def downgrade():
    op.drop_table('taxa_entrega')
