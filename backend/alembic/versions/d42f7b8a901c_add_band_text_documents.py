"""add band text documents

Revision ID: d42f7b8a901c
Revises: c31e6a9f4b20
Create Date: 2026-09-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d42f7b8a901c"
down_revision: Union[str, Sequence[str], None] = "c31e6a9f4b20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bands",
        sa.Column("description_pdf_url", sa.String(length=1000), nullable=True),
    )
    op.add_column(
        "bands",
        sa.Column("band_text_pdf_url", sa.String(length=1000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("bands", "band_text_pdf_url")
    op.drop_column("bands", "description_pdf_url")
