"""Convert jobs.highlights and trainings.highlights from TEXT to JSONB

Revision ID: f004_convert_highlights_to_jsonb
Revises: f003_add_unique_constraints_and_pks
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'f004_convert_highlights_to_jsonb'
down_revision = 'f003_add_unique_constraints_and_pks'
branch_labels = None
depends_on = None


def upgrade():
    # Null out any rows where highlights is not valid JSON before casting
    op.execute(sa.text(
        "UPDATE jobs SET highlights = NULL "
        "WHERE highlights IS NOT NULL AND highlights !~ '^[\\[{]'"
    ))
    op.execute(sa.text(
        "ALTER TABLE jobs ALTER COLUMN highlights TYPE JSONB "
        "USING highlights::jsonb"
    ))

    op.execute(sa.text(
        "UPDATE trainings SET highlights = NULL "
        "WHERE highlights IS NOT NULL AND highlights !~ '^[\\[{]'"
    ))
    op.execute(sa.text(
        "ALTER TABLE trainings ALTER COLUMN highlights TYPE JSONB "
        "USING highlights::jsonb"
    ))


def downgrade():
    op.execute(sa.text(
        "ALTER TABLE jobs ALTER COLUMN highlights TYPE TEXT "
        "USING highlights::text"
    ))
    op.execute(sa.text(
        "ALTER TABLE trainings ALTER COLUMN highlights TYPE TEXT "
        "USING highlights::text"
    ))
