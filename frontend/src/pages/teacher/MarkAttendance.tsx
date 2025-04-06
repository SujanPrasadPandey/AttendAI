// src/pages/teacher/MarkAttendance.tsx
import React, { useState } from 'react';
import apiClient from '../../utils/api';

const MarkAttendance: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] = useState<'onTime' | 'late'>('onTime');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle image uploads
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages(files);
    }
  };

  // Handle status selection
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as 'onTime' | 'late');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (images.length === 0) {
      setMessage('Please upload at least one image.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    formData.append('status', status);

    try {
      await apiClient.post('/api/facial_recognition/mark/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Attendance marked successfully!');
      setImages([]);
    } catch (error) {
      setMessage('Failed to mark attendance.');
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

      {loading && <p className="text-blue-400">Processing...</p>}
      {message && <p className={message.includes('Failed') ? 'text-red-500' : 'text-green-500'}>{message}</p>}

      {/* Status Selection */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Attendance Status:</label>
        <select
          value={status}
          onChange={handleStatusChange}
          className="w-full md:w-1/4 p-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="onTime">On Time</option>
          <option value="late">Late</option>
        </select>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Upload Classroom Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="text-gray-100 bg-gray-700 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Selected Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="Classroom Preview"
                className="rounded-md mr-2"
              />
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || images.length === 0}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-500"
      >
        AttendAI
      </button>
    </div>
  );
};

export default MarkAttendance;