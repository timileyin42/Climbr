"""f013: ensure description column on jobs table

Revision ID: f013_add_description_to_job_listing
Revises: f012_add_remote_to_jobtype
Create Date: 2026-05-28
"""
from alembic import op

revision = "f013_add_description_to_job_listing"
down_revision = "f012_add_remote_to_jobtype"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT")


def downgrade():
    pass
