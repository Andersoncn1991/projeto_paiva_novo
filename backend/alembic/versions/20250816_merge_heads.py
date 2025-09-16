"""
Revision ID: 20250816_merge_heads
Revises: 20250816_multi_refresh_tokens, 399a913ff94d
Create Date: 2025-08-16

Alembic merge migration: une múltiplos heads
"""
from alembic import op
import sqlalchemy as sa

revision = '20250816_merge_heads'
down_revision = ('20250816_multi_refresh_tokens', '399a913ff94d')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass