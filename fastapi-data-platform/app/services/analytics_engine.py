"""Analytics engine with DuckDB and fake adapter for testing."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import is_fake_mode


class AnalyticsEngine(ABC):
    """Abstract analytics engine interface."""

    @abstractmethod
    def execute(self, sql: str, limit: int = 100) -> dict:
        """Execute a query and return results."""
        ...


class FakeAnalyticsEngine(AnalyticsEngine):
    """Fake analytics engine for testing - returns sample data."""

    def execute(self, sql: str, limit: int = 100) -> dict:
        return {
            "columns": ["id", "value", "timestamp"],
            "rows": [[1, 42.5, "2025-01-01T00:00:00Z"]],
            "row_count": 1,
        }


class DuckDBAnalyticsEngine(AnalyticsEngine):
    """DuckDB-based analytics engine."""

    def __init__(self, db_path: str) -> None:
        import duckdb
        self._conn = duckdb.connect(db_path)

    def execute(self, sql: str, limit: int = 100) -> dict:
        result = self._conn.execute(f"{sql} LIMIT {limit}")
        columns = [desc[0] for desc in result.description]
        rows = result.fetchall()
        return {
            "columns": columns,
            "rows": [list(row) for row in rows],
            "row_count": len(rows),
        }


def get_analytics_engine() -> AnalyticsEngine:
    """Get analytics engine - fake for testing, DuckDB for production."""
    if is_fake_mode():
        return FakeAnalyticsEngine()
    from app.core.config import get_settings
    settings = get_settings()
    return DuckDBAnalyticsEngine(db_path=settings.duckdb_path)
