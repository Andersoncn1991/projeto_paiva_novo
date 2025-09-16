"""Cria tabelas adicionais e produto_adicional

Revision ID: 20250805_create_adicionais
Revises: 20250805_add_avatar_url_and_created_at
Create Date: 2025-08-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250805_create_adicionais'
down_revision = '20250805_add_avatar_url_and_created_at'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'adicionais',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('nome', sa.String(100), nullable=False),
        sa.Column('preco', sa.Float, nullable=True)
    )
    op.create_table(
        'produto_adicional',
        sa.Column('produto_id', sa.Integer, sa.ForeignKey('produtos.id'), primary_key=True),
        sa.Column('adicional_id', sa.Integer, sa.ForeignKey('adicionais.id'), primary_key=True)
    )

def downgrade():
    op.drop_table('produto_adicional')
    op.drop_table('adicionais')
