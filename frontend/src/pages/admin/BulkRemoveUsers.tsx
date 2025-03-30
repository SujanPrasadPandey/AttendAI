import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const BulkRemoveUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/users/admin/users/');
      if (response.status >= 200 && response.status < 300) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        setError('Failed to fetch users.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.first_name.toLowerCase().includes(lowerQuery) ||
          user.last_name.toLowerCase().includes(lowerQuery)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((user) => user.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one user to delete.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/api/users/admin/users/bulk-delete/', {
        user_ids: selectedIds,
      });
      if (response.status >= 200 && response.status < 300) {
        setSuccess(`Deleted ${response.data.deleted_count || selectedIds.length} users successfully!`);
        await fetchUsers();
        setSelectedIds([]);
      } else {
        setError('Failed to delete users.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error deleting users.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-bold mb-4">Bulk Remove Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border border-gray-700 p-2 rounded-md w-full bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearch}
          disabled={loading}
        />
      </div>
      {!loading && (
        <>
          <table className="min-w-full border-collapse bg-gray-800">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredUsers.length > 0 &&
                      selectedIds.length === filteredUsers.length
                    }
                    disabled={loading}
                  />
                </th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Username</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Email</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">First Name</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Last Name</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Role</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-700 px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelect(user.id)}
                      disabled={loading}
                    />
                  </td>
                  <td className="border border-gray-700 px-2 py-1">{user.username}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.email}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.first_name}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.last_name}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-4"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Selected Users
          </button>
        </>
      )}
    </div>
  );
};

export default BulkRemoveUsers;