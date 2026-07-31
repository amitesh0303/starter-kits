"""
Authorization policies for analytics.
"""


def can_view_dashboard(user_id: str, dashboard_owner_id: str) -> bool:
    if not user_id:
        return False
    return user_id == dashboard_owner_id


def can_edit_dashboard(user_id: str, dashboard_owner_id: str) -> bool:
    if not user_id:
        return False
    return user_id == dashboard_owner_id


def can_run_report(user_id: str, dashboard_owner_id: str) -> bool:
    if not user_id:
        return False
    return user_id == dashboard_owner_id


def can_delete_dashboard(user_id: str, dashboard_owner_id: str) -> bool:
    if not user_id:
        return False
    return user_id == dashboard_owner_id
