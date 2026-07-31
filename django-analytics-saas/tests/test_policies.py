"""
Tests for analytics authorization policies.
"""
from apps.analytics.policies import (
    can_view_dashboard,
    can_edit_dashboard,
    can_run_report,
    can_delete_dashboard,
)


class TestDashboardPolicies:
    def test_owner_can_view(self):
        assert can_view_dashboard("user1", "user1") is True

    def test_non_owner_cannot_view(self):
        assert can_view_dashboard("user2", "user1") is False

    def test_empty_user_cannot_view(self):
        assert can_view_dashboard("", "user1") is False

    def test_owner_can_edit(self):
        assert can_edit_dashboard("user1", "user1") is True

    def test_non_owner_cannot_edit(self):
        assert can_edit_dashboard("user2", "user1") is False

    def test_owner_can_run_report(self):
        assert can_run_report("user1", "user1") is True

    def test_non_owner_cannot_run_report(self):
        assert can_run_report("user2", "user1") is False

    def test_owner_can_delete(self):
        assert can_delete_dashboard("user1", "user1") is True

    def test_non_owner_cannot_delete(self):
        assert can_delete_dashboard("user2", "user1") is False
