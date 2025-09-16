"""Merge heads

Revision ID: 399a913ff94d
Revises: 20250808_add_taxa_entrega_to_pedidos, add_refresh_token_to_usuarios
Create Date: 2025-08-16 15:16:20.526233

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '399a913ff94d'
down_revision: Union[str, Sequence[str], None] = ('20250808_add_taxa_entrega_to_pedidos', 'add_refresh_token_to_usuarios')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
