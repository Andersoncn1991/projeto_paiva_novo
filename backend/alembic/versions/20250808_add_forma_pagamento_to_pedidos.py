"""
add forma_pagamento field to pedidos table

Revision ID: 20250808_add_forma_pagamento_to_pedidos
Revises: 20250808_merge_heads
Create Date: 2025-08-08
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250808_add_forma_pagamento_to_pedidos'
down_revision = '20250808_merge_heads'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('pedidos', sa.Column('forma_pagamento', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('pedidos', 'forma_pagamento')
