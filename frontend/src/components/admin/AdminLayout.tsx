import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left-side navigation bar */}
      <nav className="w-64 bg-gray-800 p-4">
        <ul className="space-y-4">
        <li>
            <NavLink
              to="/admin/manage-attendance"
              end
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage-teacher-access-requests"
              end
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Teacher Access Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/leave-requests"
              end
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Leave Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/teacher"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Teachers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/student"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Students
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage-student-photos"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Students Photos
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/parent"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Parents
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/admin"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Admins
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage-classes"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Classes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage-subjects"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Subjects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bulk-add"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Bulk Add Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bulk-remove"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Bulk Remove Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/unrecognized-faces"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Unrecognized Faces
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/review-faces"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Review Faces
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/profile-settings"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Profile Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* Renders child routes like AdminDashboard or StudentDetails */}
      </main>
    </div>
  );
};

export default AdminLayout;