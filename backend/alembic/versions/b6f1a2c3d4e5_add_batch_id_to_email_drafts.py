"""add batch id to email drafts

Revision ID: b6f1a2c3d4e5
Revises: 01412dfe1add
Create Date: 2026-11-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6f1a2c3d4e5"
down_revision: Union[str, Sequence[str], None] = "01412dfe1add"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "email_drafts",
        sa.Column("batch_id", sa.String(length=36), nullable=True),
    )
    op.create_index(
        "ix_email_drafts_batch_id",
        "email_drafts",
        ["batch_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_email_drafts_batch_id", table_name="email_drafts")
    op.drop_column("email_drafts", "batch_id")
