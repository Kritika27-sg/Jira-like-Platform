# You can put helper functions here as needed, e.g., for activity logging

def log_activity(db_session, task_id, user_id, action):
    from app.models.activity_log import ActivityLog

    log = ActivityLog(
        task_id=task_id,
        user_id=user_id,
        action=action,
    )
    db_session.add(log)
    db_session.commit()
