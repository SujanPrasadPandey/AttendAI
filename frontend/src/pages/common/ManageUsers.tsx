import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

interface ManageUsersProps {
  role: string;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ role }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get(`/api/users/admin/users/?role=${role}`)
      .then(response => {
        setUsers(response.data);
      })
      .catch(err => {
        console.error(`Error fetching ${role}s:`, err);
        setError(`Failed to fetch ${role}s.`);
      });
  }, [role]);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.first_name && user.first_name.toLowerCase().includes(query)) ||
      (user.last_name && user.last_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">
          Manage {role.charAt(0).toUpperCase() + role.slice(1)}s
        </h2>
        <Link
          to={`/manage/${role}/add`}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-gray-100"
        >
          Add {role.charAt(0).toUpperCase() + role.slice(1)}
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search ${role}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-700 p-2 rounded-md w-full bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Photo</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Username</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Email</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">First Name</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Last Name</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-800">
                <td className="border border-gray-700 px-4 py-2">
                  <img
                    src={user.profile_picture || "/default-profile.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="border border-gray-700 px-4 py-2">{user.username}</td>
                <td className="border border-gray-700 px-4 py-2">{user.email}</td>
                <td className="border border-gray-700 px-4 py-2">{user.first_name || '-'}</td>
                <td className="border border-gray-700 px-4 py-2">{user.last_name || '-'}</td>
                <td className="border border-gray-700 px-4 py-2">
                  <Link
                    to={`/manage/${role}/edit/${user.id}`}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-300">No {role}s found.</p>
      )}
    </div>
  );
};

export default ManageUsers;
