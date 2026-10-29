"""add user authentication and interview ownership

Revision ID: 7cf0e1a2b3d4
Revises: 6672a2907d15
Create Date: 2026-10-14 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "7cf0e1a2b3d4"
down_revision: Union[str, Sequence[str], None] = "6672a2907d15"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.add_column(
        "interview_sessions",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_interview_sessions_user_id_users",
        "interview_sessions",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(
        "ix_interview_sessions_user_id",
        "interview_sessions",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_interview_sessions_user_id", table_name="interview_sessions")
    op.drop_constraint(
        "fk_interview_sessions_user_id_users",
        "interview_sessions",
        type_="foreignkey",
    )
    op.drop_column("interview_sessions", "user_id")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
