"""Add performance indexes on hot-path columns

Revision ID: f007_add_performance_indexes
Revises: f006_payment_status_enum_and_currency
Create Date: 2026-05-24
"""
from alembic import op

revision = 'f007_add_performance_indexes'
down_revision = 'f006_payment_status_enum_and_currency'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_jobs_status', 'jobs', ['status'])
    op.create_index('ix_jobs_expiry_date', 'jobs', ['expiry_date'])
    op.create_index('ix_trainings_status', 'trainings', ['status'])
    op.create_index('ix_trainings_expiry_date', 'trainings', ['expiry_date'])
    op.create_index('ix_job_applications_job_id', 'job_applications', ['job_id'])
    op.create_index('ix_job_applications_talent_id', 'job_applications', ['talent_id'])
    op.create_index('ix_training_applications_training_id', 'training_applications', ['training_id'])
    op.create_index('ix_training_applications_talent_id', 'training_applications', ['talent_id'])
    op.create_index('ix_saved_jobs_talent_id', 'saved_jobs', ['talent_id'])
    op.create_index('ix_payments_transaction_id', 'payments', ['transaction_id'])


def downgrade():
    op.drop_index('ix_payments_transaction_id', table_name='payments')
    op.drop_index('ix_saved_jobs_talent_id', table_name='saved_jobs')
    op.drop_index('ix_training_applications_talent_id', table_name='training_applications')
    op.drop_index('ix_training_applications_training_id', table_name='training_applications')
    op.drop_index('ix_job_applications_talent_id', table_name='job_applications')
    op.drop_index('ix_job_applications_job_id', table_name='job_applications')
    op.drop_index('ix_trainings_expiry_date', table_name='trainings')
    op.drop_index('ix_trainings_status', table_name='trainings')
    op.drop_index('ix_jobs_expiry_date', table_name='jobs')
    op.drop_index('ix_jobs_status', table_name='jobs')
