"""add epk contents to bands

Revision ID: 01412dfe1add
Revises: e53a8c7d102b
Create Date: 2026-11-07 18:35:43.159368

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01412dfe1add'
down_revision: Union[str, Sequence[str], None] = 'e53a8c7d102b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bands",
        sa.Column("epk_contents", sa.JSON(), nullable=False, server_default="[]"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("bands", "epk_contents")
