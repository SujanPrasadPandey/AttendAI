from rest_framework import permissions

class AdminOnlyPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'admin' role
        return request.user.is_authenticated and request.user.role == 'admin'

class TeacherOrAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated and has either 'teacher' or 'admin' role
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']