"""Add saved_trainings table

Revision ID: f008_saved_trainings
Revises: f007_add_performance_indexes
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'f008_saved_trainings'
down_revision = 'f007_add_performance_indexes'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'saved_trainings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('training_id', sa.Integer(), sa.ForeignKey('trainings.id'), nullable=False),
        sa.Column('talent_id', sa.Integer(), sa.ForeignKey('talents.id'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('training_id', 'talent_id', name='uq_saved_trainings_training_talent'),
    )


def downgrade():
    op.drop_table('saved_trainings')
