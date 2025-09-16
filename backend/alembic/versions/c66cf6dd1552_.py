"""empty message

Revision ID: c66cf6dd1552
Revises: 180026238f15, 20250827_auto_increment_all_ids
Create Date: 2025-08-26 17:42:03.713587

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c66cf6dd1552'
down_revision: Union[str, Sequence[str], None] = ('180026238f15', '20250827_auto_increment_all_ids')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
