"""Add missing job_credits and training_credits columns

Revision ID: f001_add_missing_credit_columns
Revises: ae700d95ab2d
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'f001_add_missing_credit_columns'
down_revision = 'ae700d95ab2d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('employers', sa.Column('job_credits', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('trainers', sa.Column('training_credits', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    op.drop_column('trainers', 'training_credits')
    op.drop_column('employers', 'job_credits')
