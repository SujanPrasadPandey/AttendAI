from rest_framework import permissions

class TeacherOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has either 'teacher' or 'admin' role
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']