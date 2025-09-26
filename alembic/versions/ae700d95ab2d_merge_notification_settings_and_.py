"""merge_notification_settings_and_training_fields

Revision ID: ae700d95ab2d
Revises: add_notification_settings, add_training_fields
Create Date: 2025-07-19 00:38:33.425947

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ae700d95ab2d'
down_revision: Union[str, None] = ('add_notification_settings', 'add_training_fields')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
