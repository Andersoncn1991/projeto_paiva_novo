"""
Revision ID: 20250816_multi_refresh_tokens
Revises: add_refresh_token_to_usuarios
Create Date: 2025-08-16

Alembic migration: Adiciona campo refresh_tokens e remove refresh_token/refresh_token_expira_em
"""
from alembic import op
import sqlalchemy as sa

revision = '20250816_multi_refresh_tokens'
down_revision = 'add_refresh_token_to_usuarios'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('usuarios') as batch_op:
        batch_op.drop_column('refresh_token')
        batch_op.drop_column('refresh_token_expira_em')
        batch_op.add_column(sa.Column('refresh_tokens', sa.String(), nullable=True))

def downgrade():
    with op.batch_alter_table('usuarios') as batch_op:
        batch_op.drop_column('refresh_tokens')
        batch_op.add_column(sa.Column('refresh_token', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('refresh_token_expira_em', sa.DateTime(), nullable=True))