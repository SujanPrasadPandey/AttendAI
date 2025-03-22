import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/admin/manage/teacher"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Manage Teachers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/student"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Manage Students
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/parent"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Manage Parents
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/manage/admin"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Manage Admins
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bulk-add"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Bulk Add Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/bulk-remove"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Bulk Remove Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/profile-settings"
              className={({ isActive }) => (isActive ? 'font-bold' : '')}
            >
              Profile Settings
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <main className="flex-1 p-4 overflow-auto bg-gray-900 text-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
