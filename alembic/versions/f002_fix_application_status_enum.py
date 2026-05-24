"""Add in_review and shortlisted values to applicationstatus enum

Revision ID: f002_fix_application_status_enum
Revises: f001_add_missing_credit_columns
Create Date: 2026-05-24

PostgreSQL does not support removing enum values, so downgrade is a no-op.
"""
from alembic import op
import sqlalchemy as sa

revision = 'f002_fix_application_status_enum'
down_revision = 'f001_add_missing_credit_columns'
branch_labels = None
depends_on = None


def upgrade():
    # ALTER TYPE ... ADD VALUE must run outside a transaction in PostgreSQL
    conn = op.get_bind()
    conn.execution_options(isolation_level="AUTOCOMMIT").execute(
        sa.text("ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'in_review'")
    )
    conn.execution_options(isolation_level="AUTOCOMMIT").execute(
        sa.text("ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'shortlisted'")
    )


def downgrade():
    # PostgreSQL does not support removing enum values.
    # The values are safe to leave in place — they simply won't be used.
    pass
