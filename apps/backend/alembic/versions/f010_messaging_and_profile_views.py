"""f010: messaging and profile views

Revision ID: f010_messaging_and_profile_views
Revises: f009_notifications_and_device_tokens
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = "f010_messaging_and_profile_views"
down_revision = "f009_notifications_and_device_tokens"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("participant_1_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("participant_2_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("last_message_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("participant_1_id", "participant_2_id", name="uq_conversation_participants"),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id"), nullable=False, index=True),
        sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "profile_views",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("viewer_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("viewed_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("viewed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_profile_views_viewed_user_id", "profile_views", ["viewed_user_id"])


def downgrade():
    op.drop_index("ix_profile_views_viewed_user_id", table_name="profile_views")
    op.drop_table("profile_views")
    op.drop_table("messages")
    op.drop_table("conversations")
