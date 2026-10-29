from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    validate_jwt_configuration,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, UserCreate

user_repository = UserRepository()


def _create_auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(str(user.id)),
        user=user,
    )


def register_user(db: Session, user_data: UserCreate) -> AuthResponse:
    validate_jwt_configuration()
    email = str(user_data.email).lower()
    if user_repository.get_by_email(db, email) is not None:
        raise ValueError("An account with this email already exists.")

    try:
        user = user_repository.create(
            db,
            email=email,
            hashed_password=hash_password(user_data.password),
        )
    except IntegrityError as exc:
        if user_repository.get_by_email(db, email) is not None:
            raise ValueError("An account with this email already exists.") from exc
        raise
    return _create_auth_response(user)


def authenticate_user(db: Session, email: str, password: str) -> AuthResponse | None:
    validate_jwt_configuration()
    user = user_repository.get_by_email(db, email.lower())
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return _create_auth_response(user)
