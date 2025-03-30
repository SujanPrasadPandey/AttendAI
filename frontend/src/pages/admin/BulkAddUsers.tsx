import React, { useState } from 'react';
import Papa from 'papaparse';
import apiClient from '../../utils/api';

interface UserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

const BulkAddUsers: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<UserData[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCsvFile(e.target.files[0]);
      setParsedData([]);
      setError('');
      setSuccess('');
    }
  };

  const parseCSV = () => {
    if (!csvFile) return;

    Papa.parse<UserData>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setError('Error parsing CSV. Please check the format.');
          console.error(results.errors);
        } else {
          setParsedData(results.data);
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!csvFile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await apiClient.post('/api/users/admin/users/bulk-create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status >= 200 && response.status < 300) {
        setSuccess('Users added successfully!');
        setCsvFile(null);
        setParsedData([]);
      } else {
        setError('Failed to add users.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred while submitting the data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-bold mb-4">Bulk Add Users</h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-gray-100"
          disabled={loading}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ml-2"
          onClick={parseCSV}
          disabled={!csvFile || loading}
        >
          Parse CSV
        </button>
      </div>
      {loading && <p>Processing...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}
      {parsedData.length > 0 && (
        <>
          <h3 className="mt-4 font-semibold text-gray-100">Preview:</h3>
          <table className="min-w-full mt-2 border-collapse bg-gray-800">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Username</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Email</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">First Name</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Last Name</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Phone Number</th>
                <th className="border border-gray-700 px-2 py-1 text-gray-100">Role</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {parsedData.map((user, index) => (
                <tr key={index}>
                  <td className="border border-gray-700 px-2 py-1">{user.username}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.email}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.first_name}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.last_name}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.phone_number}</td>
                  <td className="border border-gray-700 px-2 py-1">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4"
            onClick={handleSubmit}
            disabled={loading}
          >
            Submit Users
          </button>
        </>
      )}
    </div>
  );
};

export default BulkAddUsers;