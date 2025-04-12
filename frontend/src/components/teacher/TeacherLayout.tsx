// src/components/teacher/TeacherLayout.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const TeacherLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left-side navigation bar */}
      <nav className="w-64 bg-gray-800 p-4">
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/teacher/manage-attendance"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Manage Attendance
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teacher/mark-attendance"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Mark Attendance
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teacher/profile"
              className={({ isActive }) => (isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400')}
            >
              Profile
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* Renders child routes like ManageAttendance, MarkAttendance, or Profile */}
      </main>
    </div>
  );
};

export default TeacherLayout;