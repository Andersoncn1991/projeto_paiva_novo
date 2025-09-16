"""add avatar_url and created_at to usuarios

Revision ID: 20250805_add_avatar_url_and_created_at
Revises: 0d83e20addb7_init
Create Date: 2025-08-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250805_add_avatar_url_and_created_at'
down_revision = '0d83e20addb7'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('usuarios', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('usuarios', sa.Column('created_at', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('usuarios', 'avatar_url')
    op.drop_column('usuarios', 'created_at')