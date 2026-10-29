import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.core import security
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.services import auth_service
from app.schemas.auth import UserCreate


def test_password_hash_verifies_only_the_original_password():
    hashed_password = hash_password("correct-horse-battery-staple")

    assert verify_password("correct-horse-battery-staple", hashed_password)
    assert not verify_password("not-the-password", hashed_password)


def test_access_token_round_trip(monkeypatch):
    monkeypatch.setattr(security.settings, "jwt_secret_key", "s" * 32)

    token = create_access_token("user-123")

    assert decode_access_token(token)["sub"] == "user-123"


def test_access_token_requires_a_configured_secret(monkeypatch):
    monkeypatch.setattr(security.settings, "jwt_secret_key", None)

    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        create_access_token("user-123")


def test_authenticate_user_rejects_incorrect_password(monkeypatch):
    monkeypatch.setattr(security.settings, "jwt_secret_key", "s" * 32)
    db = MagicMock()
    user = SimpleNamespace(
        id=uuid.uuid4(),
        email="candidate@example.com",
        hashed_password=hash_password("correct-password"),
    )
    monkeypatch.setattr(
        auth_service.user_repository,
        "get_by_email",
        lambda _db, _email: user,
    )

    assert auth_service.authenticate_user(
        db,
        "candidate@example.com",
        "incorrect-password",
    ) is None


def test_register_user_normalizes_email_and_returns_access_token(monkeypatch):
    monkeypatch.setattr(security.settings, "jwt_secret_key", "s" * 32)
    user_id = uuid.uuid4()
    stored_user = SimpleNamespace(
        id=user_id,
        email="candidate@example.com",
    )
    captured = {}
    def get_user(_db, email):
        captured["lookup_email"] = email
        return None

    monkeypatch.setattr(auth_service.user_repository, "get_by_email", get_user)

    def create_user(_db, email, hashed_password):
        captured["email"] = email
        captured["hashed_password"] = hashed_password
        return stored_user

    monkeypatch.setattr(auth_service.user_repository, "create", create_user)

    response = auth_service.register_user(
        MagicMock(),
        UserCreate(email="Candidate@Example.com", password="secure-password"),
    )

    assert response.user.email == "candidate@example.com"
    assert captured["lookup_email"] == "candidate@example.com"
    assert captured["email"] == "candidate@example.com"
    assert verify_password("secure-password", captured["hashed_password"])
    assert decode_access_token(response.access_token)["sub"] == str(user_id)


def test_register_user_rejects_duplicate_email(monkeypatch):
    monkeypatch.setattr(security.settings, "jwt_secret_key", "s" * 32)
    existing_user = SimpleNamespace(id=uuid.uuid4(), email="candidate@example.com")
    monkeypatch.setattr(
        auth_service.user_repository,
        "get_by_email",
        lambda _db, _email: existing_user,
    )

    with pytest.raises(ValueError, match="already exists"):
        auth_service.register_user(
            MagicMock(),
            UserCreate(email="candidate@example.com", password="secure-password"),
        )
