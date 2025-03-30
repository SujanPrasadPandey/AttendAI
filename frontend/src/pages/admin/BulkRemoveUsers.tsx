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
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/users/admin/users/');
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch users.');
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
      alert('Please select at least one user to delete.');
      return;
    }
    try {
      const response = await apiClient.post('/api/users/admin/users/bulk-delete/', {
        user_ids: selectedIds,
      });
      alert(`Deleted ${response.data.deleted_count} users successfully!`);
      fetchUsers();
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      alert('Error deleting users.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bulk Remove Users</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border p-2 w-full"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredUsers.length > 0 &&
                      selectedIds.length === filteredUsers.length
                    }
                  />
                </th>
                <th className="border px-2 py-1">Username</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">First Name</th>
                <th className="border px-2 py-1">Last Name</th>
                <th className="border px-2 py-1">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleSelect(user.id)}
                    />
                  </td>
                  <td className="border px-2 py-1">{user.username}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.first_name}</td>
                  <td className="border px-2 py-1">{user.last_name}</td>
                  <td className="border px-2 py-1">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleDelete}
          >
            Delete Selected Users
          </button>
        </>
      )}
    </div>
  );
};

export default BulkRemoveUsers;
