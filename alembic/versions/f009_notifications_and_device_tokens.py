"""f009: notifications and device tokens

Revision ID: f009_notifications_and_device_tokens
Revises: f008_saved_trainings
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'f009_notifications_and_device_tokens'
down_revision = 'f008_saved_trainings'
branch_labels = None
depends_on = None


def upgrade():
    # Notification type enum
    notification_type = sa.Enum(
        'job_match', 'application_update', 'training_match', 'system',
        name='notificationtype'
    )
    notification_type.create(op.get_bind(), checkfirst=True)

    # Device platform enum
    device_platform = sa.Enum(
        'ios', 'android', 'web',
        name='deviceplatform'
    )
    device_platform.create(op.get_bind(), checkfirst=True)

    # notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('type', sa.Enum('job_match', 'application_update', 'training_match', 'system', name='notificationtype'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('data', JSONB(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_id', 'notifications', ['id'])

    # device_tokens table
    op.create_table(
        'device_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('talent_id', sa.Integer(), sa.ForeignKey('talents.id'), nullable=False),
        sa.Column('token', sa.String(), nullable=False, unique=True),
        sa.Column('platform', sa.Enum('ios', 'android', 'web', name='deviceplatform'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_device_tokens_talent_id', 'device_tokens', ['talent_id'])
    op.create_index('ix_device_tokens_id', 'device_tokens', ['id'])


def downgrade():
    op.drop_table('device_tokens')
    op.drop_table('notifications')
    op.execute("DROP TYPE IF EXISTS deviceplatform")
    op.execute("DROP TYPE IF EXISTS notificationtype")
