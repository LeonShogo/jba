"""add social media links and expand genre text

Revision ID: 0a1b2c3d4e5f
Revises: f7a8b9c0d1e2
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0a1b2c3d4e5f"
down_revision: Union[str, Sequence[str], None] = "f7a8b9c0d1e2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "bands",
        "genre",
        existing_type=sa.String(length=200),
        type_=sa.Text(),
        existing_nullable=True,
    )
    op.add_column(
        "bands",
        sa.Column("social_media", sa.JSON(), server_default="{}", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("bands", "social_media")
    op.alter_column(
        "bands",
        "genre",
        existing_type=sa.Text(),
        type_=sa.String(length=200),
        existing_nullable=True,
    )
