"""f011: add free monthly posts tracking to employers and trainers

Revision ID: f011_free_monthly_posts
Revises: f010_messaging_and_profile_views
Create Date: 2026-05-27
"""
from alembic import op
import sqlalchemy as sa

revision = "f011_free_monthly_posts"
down_revision = "f010_messaging_and_profile_views"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("employers", sa.Column("free_posts_used",  sa.Integer(), nullable=False, server_default="0"))
    op.add_column("employers", sa.Column("free_posts_month", sa.String(),  nullable=True))
    op.add_column("trainers",  sa.Column("free_posts_used",  sa.Integer(), nullable=False, server_default="0"))
    op.add_column("trainers",  sa.Column("free_posts_month", sa.String(),  nullable=True))


def downgrade():
    op.drop_column("employers", "free_posts_used")
    op.drop_column("employers", "free_posts_month")
    op.drop_column("trainers",  "free_posts_used")
    op.drop_column("trainers",  "free_posts_month")
