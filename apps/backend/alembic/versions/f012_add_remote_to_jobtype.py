"""f012: add remote to jobtype enum

Revision ID: f012_add_remote_to_jobtype
Revises: f011_free_monthly_posts
Create Date: 2026-05-27
"""
from alembic import op

revision = "f012_add_remote_to_jobtype"
down_revision = "f011_free_monthly_posts"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE jobtype ADD VALUE IF NOT EXISTS 'remote'")


def downgrade():
    pass  # PostgreSQL does not support removing enum values
