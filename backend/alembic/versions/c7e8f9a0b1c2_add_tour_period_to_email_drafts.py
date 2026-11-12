"""add tour period to email drafts

Revision ID: c7e8f9a0b1c2
Revises: b6f1a2c3d4e5
Create Date: 2026-11-12
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7e8f9a0b1c2"
down_revision: Union[str, Sequence[str], None] = "b6f1a2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "email_drafts",
        sa.Column("tour_period", sa.String(length=200), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("email_drafts", "tour_period")
