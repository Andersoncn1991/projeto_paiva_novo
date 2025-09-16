"""
Alembic migration script: Adiciona campos de refresh token à tabela usuarios
"""
from alembic import op
import sqlalchemy as sa

# Revisão e dependências
revision = 'add_refresh_token_to_usuarios'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('usuarios', sa.Column('refresh_token', sa.String(), nullable=True))
    op.add_column('usuarios', sa.Column('refresh_token_expira_em', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('usuarios', 'refresh_token')
    op.drop_column('usuarios', 'refresh_token_expira_em')
