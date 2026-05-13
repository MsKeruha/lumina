"""add challenges and polls

Revision ID: d4a20bfca810
Revises: ceb0c7db95ef
Create Date: 2026-05-13 12:22:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4a20bfca810'
down_revision: Union[str, Sequence[str], None] = 'ceb0c7db95ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create reading_challenges
    op.create_table(
        'reading_challenges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('target_books', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reading_challenges_id'), 'reading_challenges', ['id'], unique=False)
    op.create_index(op.f('ix_reading_challenges_user_id'), 'reading_challenges', ['user_id'], unique=False)
    op.create_index(op.f('ix_reading_challenges_year'), 'reading_challenges', ['year'], unique=False)

    # Create polls
    op.create_table(
        'polls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('club_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('is_active', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_polls_club_id'), 'polls', ['club_id'], unique=False)
    op.create_index(op.f('ix_polls_id'), 'polls', ['id'], unique=False)

    # Create poll_options
    op.create_table(
        'poll_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('poll_id', sa.Integer(), nullable=True),
        sa.Column('book_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ),
        sa.ForeignKeyConstraint(['poll_id'], ['polls.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_poll_options_id'), 'poll_options', ['id'], unique=False)
    op.create_index(op.f('ix_poll_options_poll_id'), 'poll_options', ['poll_id'], unique=False)

    # Create poll_votes
    op.create_table(
        'poll_votes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('option_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['option_id'], ['poll_options.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_poll_votes_id'), 'poll_votes', ['id'], unique=False)
    op.create_index(op.f('ix_poll_votes_option_id'), 'poll_votes', ['option_id'], unique=False)
    op.create_index(op.f('ix_poll_votes_user_id'), 'poll_votes', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_poll_votes_user_id'), table_name='poll_votes')
    op.drop_index(op.f('ix_poll_votes_option_id'), table_name='poll_votes')
    op.drop_index(op.f('ix_poll_votes_id'), table_name='poll_votes')
    op.drop_table('poll_votes')

    op.drop_index(op.f('ix_poll_options_poll_id'), table_name='poll_options')
    op.drop_index(op.f('ix_poll_options_id'), table_name='poll_options')
    op.drop_table('poll_options')

    op.drop_index(op.f('ix_polls_id'), table_name='polls')
    op.drop_index(op.f('ix_polls_club_id'), table_name='polls')
    op.drop_table('polls')

    op.drop_index(op.f('ix_reading_challenges_year'), table_name='reading_challenges')
    op.drop_index(op.f('ix_reading_challenges_user_id'), table_name='reading_challenges')
    op.drop_index(op.f('ix_reading_challenges_id'), table_name='reading_challenges')
    op.drop_table('reading_challenges')
