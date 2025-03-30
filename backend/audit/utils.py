from .models import AuditLog

def log_action(user, action, description=""):
    """
    Records an audit log entry.
    :param user: The user (instance of AUTH_USER_MODEL) who performed the action.
    :param action: A short string describing the action.
    :param description: Optional detailed description of the action.
    """
    AuditLog.objects.create(user=user, action=action, description=description)
