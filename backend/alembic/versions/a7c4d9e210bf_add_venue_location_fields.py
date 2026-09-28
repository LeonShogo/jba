"""add venue location fields

Revision ID: a7c4d9e210bf
Revises: 0429e9a2aac2
Create Date: 2026-09-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7c4d9e210bf"
down_revision: Union[str, Sequence[str], None] = "0429e9a2aac2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("state", sa.String(length=100), nullable=True))
    op.add_column("venues", sa.Column("country", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("venues", "country")
    op.drop_column("venues", "state")
