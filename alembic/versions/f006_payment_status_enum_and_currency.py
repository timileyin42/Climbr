"""Convert payments.status to enum; change currency default to NGN

Revision ID: f006_payment_status_enum_and_currency
Revises: f005_firebase_auth_and_token_hashing
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'f006_payment_status_enum_and_currency'
down_revision = 'f005_firebase_auth_and_token_hashing'
branch_labels = None
depends_on = None

# Enum values that match PaymentStatus in database_models.py
VALID_STATUSES = ('pending', 'success', 'failed', 'abandoned', 'reversed')


def upgrade():
    conn = op.get_bind()

    # Create the enum type
    conn.execution_options(isolation_level="AUTOCOMMIT").execute(
        sa.text(
            "CREATE TYPE IF NOT EXISTS paymentstatus AS ENUM "
            "('pending', 'success', 'failed', 'abandoned', 'reversed')"
        )
    )

    # Normalise any existing free-text status values to 'pending'
    valid_in = ", ".join(f"'{v}'" for v in VALID_STATUSES)
    op.execute(sa.text(
        f"UPDATE payments SET status = 'pending' WHERE status NOT IN ({valid_in})"
    ))

    # Cast the column to the enum type
    op.execute(sa.text(
        "ALTER TABLE payments ALTER COLUMN status TYPE paymentstatus "
        "USING status::paymentstatus"
    ))

    # Update currency default to NGN
    op.alter_column('payments', 'currency', server_default='NGN')
    op.alter_column('job_pricing', 'currency', server_default='NGN')
    op.alter_column('training_pricing', 'currency', server_default='NGN')


def downgrade():
    op.alter_column('training_pricing', 'currency', server_default='GBP')
    op.alter_column('job_pricing', 'currency', server_default='GBP')
    op.alter_column('payments', 'currency', server_default='GBP')

    op.execute(sa.text(
        "ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR "
        "USING status::text"
    ))
    op.execute(sa.text("DROP TYPE IF EXISTS paymentstatus"))
