"""add band details

Revision ID: c31e6a9f4b20
Revises: a7c4d9e210bf
Create Date: 2026-09-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c31e6a9f4b20"
down_revision: Union[str, Sequence[str], None] = "a7c4d9e210bf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("bands", sa.Column("genre", sa.String(length=200), nullable=True))
    op.add_column("bands", sa.Column("lineup", sa.Text(), nullable=True))
    op.add_column("bands", sa.Column("equipment", sa.Text(), nullable=True))
    op.add_column("bands", sa.Column("epk_url", sa.String(length=1000), nullable=True))
    op.add_column("bands", sa.Column("photo_url", sa.String(length=1000), nullable=True))
    op.add_column("bands", sa.Column("music_url", sa.String(length=1000), nullable=True))
    op.add_column("bands", sa.Column("tech_rider_url", sa.String(length=1000), nullable=True))
    op.add_column("bands", sa.Column("stage_plan_url", sa.String(length=1000), nullable=True))
    op.add_column("bands", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("bands", sa.Column("band_text", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("bands", "band_text")
    op.drop_column("bands", "description")
    op.drop_column("bands", "stage_plan_url")
    op.drop_column("bands", "tech_rider_url")
    op.drop_column("bands", "music_url")
    op.drop_column("bands", "photo_url")
    op.drop_column("bands", "epk_url")
    op.drop_column("bands", "equipment")
    op.drop_column("bands", "lineup")
    op.drop_column("bands", "genre")
