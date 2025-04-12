// src/components/student/StudentLayout.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const StudentLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left-side navigation bar */}
      <nav className="w-64 bg-gray-800 p-4">
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/student"
              end
              className={({ isActive }) =>
                isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400'
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/student/leave-requests"
              className={({ isActive }) =>
                isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400'
              }
            >
              Leave Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/student/profile"
              className={({ isActive }) =>
                isActive ? 'font-bold text-blue-400' : 'text-gray-300 hover:text-blue-400'
              }
            >
              Profile
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* Renders child routes like LeaveRequests */}
      </main>
    </div>
  );
};

export default StudentLayout;