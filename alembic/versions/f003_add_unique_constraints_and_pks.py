"""Add unique constraints to join tables and composite PKs to association tables

Revision ID: f003_add_unique_constraints_and_pks
Revises: f002_fix_application_status_enum
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'f003_add_unique_constraints_and_pks'
down_revision = 'f002_fix_application_status_enum'
branch_labels = None
depends_on = None


def upgrade():
    # Some historical revision IDs are longer than Alembic's default VARCHAR(32).
    op.alter_column(
        'alembic_version',
        'version_num',
        existing_type=sa.String(length=32),
        type_=sa.String(length=128),
        existing_nullable=False,
    )

    # Unique constraint: one application per talent per job
    op.create_unique_constraint(
        'uq_job_applications_job_talent', 'job_applications', ['job_id', 'talent_id']
    )
    # Unique constraint: one application per talent per training
    op.create_unique_constraint(
        'uq_training_applications_training_talent', 'training_applications', ['training_id', 'talent_id']
    )
    # Unique constraint: a talent can only save a job once
    op.create_unique_constraint(
        'uq_saved_jobs_job_talent', 'saved_jobs', ['job_id', 'talent_id']
    )

    # Composite PKs on association tables (prevent duplicate M2M rows)
    op.create_primary_key('pk_talent_skills', 'talent_skills', ['talent_id', 'skill_id'])
    op.create_primary_key('pk_job_skills', 'job_skills', ['job_id', 'skill_id'])
    op.create_primary_key('pk_training_skills', 'training_skills', ['training_id', 'skill_id'])


def downgrade():
    op.drop_constraint('pk_training_skills', 'training_skills', type_='primary')
    op.drop_constraint('pk_job_skills', 'job_skills', type_='primary')
    op.drop_constraint('pk_talent_skills', 'talent_skills', type_='primary')

    op.drop_constraint('uq_saved_jobs_job_talent', 'saved_jobs', type_='unique')
    op.drop_constraint('uq_training_applications_training_talent', 'training_applications', type_='unique')
    op.drop_constraint('uq_job_applications_job_talent', 'job_applications', type_='unique')
