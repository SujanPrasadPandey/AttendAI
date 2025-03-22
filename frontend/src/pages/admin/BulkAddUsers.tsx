import React, { useState } from 'react';
import Papa from 'papaparse';
import apiClient from '../../utils/api'; // Use your axios instance

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCsvFile(e.target.files[0]);
      setParsedData([]);
      setError('');
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
    
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await apiClient.post('/api/users/admin/users/bulk-create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      alert('Users added successfully!');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'An error occurred while submitting the data.';
      alert(`Error: ${errMsg}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bulk Add Users</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        onClick={parseCSV}
        disabled={!csvFile}
      >
        Parse CSV
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {parsedData.length > 0 && (
        <>
          <h3 className="mt-4 font-semibold">Preview:</h3>
          <table className="min-w-full mt-2 border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Username</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">First Name</th>
                <th className="border px-2 py-1">Last Name</th>
                <th className="border px-2 py-1">Phone Number</th>
                <th className="border px-2 py-1">Role</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((user, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{user.username}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.first_name}</td>
                  <td className="border px-2 py-1">{user.last_name}</td>
                  <td className="border px-2 py-1">{user.phone_number}</td>
                  <td className="border px-2 py-1">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleSubmit}
          >
            Submit Users
          </button>
        </>
      )}
    </div>
  );
};

export default BulkAddUsers;
