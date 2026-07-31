"""In-memory user store for development and testing."""

import uuid


class UserStore:
    """Simple in-memory user store. Replace with SQLAlchemy in production."""

    def __init__(self) -> None:
        self._users: dict[str, dict] = {}

    def create(self, email: str, hashed_password: str) -> dict:
        """Create a new user."""
        user_id = str(uuid.uuid4())
        user = {"id": user_id, "email": email, "hashed_password": hashed_password}
        self._users[user_id] = user
        return user

    def get_by_email(self, email: str) -> dict | None:
        """Find user by email."""
        for user in self._users.values():
            if user["email"] == email:
                return user
        return None

    def get_by_id(self, user_id: str) -> dict | None:
        """Find user by ID."""
        return self._users.get(user_id)

    def reset(self) -> None:
        """Clear all users (for testing)."""
        self._users.clear()


user_store = UserStore()
