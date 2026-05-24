"""Replace google_id with firebase_uid; rename token columns to *_hash

Revision ID: f005_firebase_auth_and_token_hashing
Revises: f004_convert_highlights_to_jsonb
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision = 'f005_firebase_auth_and_token_hashing'
down_revision = 'f004_convert_highlights_to_jsonb'
branch_labels = None
depends_on = None


def upgrade():
    # Replace google_id with firebase_uid
    op.drop_column('users', 'google_id')
    op.add_column('users', sa.Column('firebase_uid', sa.String(), nullable=True))
    op.create_unique_constraint('uq_users_firebase_uid', 'users', ['firebase_uid'])
    op.create_index('ix_users_firebase_uid', 'users', ['firebase_uid'])

    # Rename token columns to *_hash (stored as hashed values from now on)
    op.alter_column('users', 'verification_token', new_column_name='verification_token_hash')
    op.alter_column('users', 'password_reset_token', new_column_name='password_reset_token_hash')


def downgrade():
    op.alter_column('users', 'password_reset_token_hash', new_column_name='password_reset_token')
    op.alter_column('users', 'verification_token_hash', new_column_name='verification_token')

    op.drop_index('ix_users_firebase_uid', table_name='users')
    op.drop_constraint('uq_users_firebase_uid', 'users', type_='unique')
    op.drop_column('users', 'firebase_uid')
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
