"""add equipment document

Revision ID: e53a8c7d102b
Revises: d42f7b8a901c
Create Date: 2026-09-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e53a8c7d102b"
down_revision: Union[str, Sequence[str], None] = "d42f7b8a901c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bands",
        sa.Column("equipment_pdf_url", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("bands", "equipment_pdf_url")
