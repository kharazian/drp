"""Add draft_title to form

Revision ID: c9b7d1a4e2af
Revises: 7f19e8f9c2ab
Create Date: 2026-04-09 16:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c9b7d1a4e2af"
down_revision = "7f19e8f9c2ab"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("form", sa.Column("draft_title", sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column("form", "draft_title")
