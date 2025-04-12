from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    """
    Allows access only to authenticated users with role 'student'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'

class IsAdmin(BasePermission):
    """
    Allows access only to authenticated users with role 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'