import React, { useState } from 'react';
import apiClient from '../../utils/api';

const MarkAttendance: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]); // Store images or a single video
  const [status, setStatus] = useState<'onTime' | 'late'>('onTime');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isVideo, setIsVideo] = useState(false); // Track if a video is uploaded

  // Handle file uploads (images or video)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedFiles = Array.from(event.target.files);
      if (uploadedFiles.length > 0) {
        const isVideoFile = uploadedFiles[0].type.startsWith('video/');
        setIsVideo(isVideoFile);
        setFiles(isVideoFile ? [uploadedFiles[0]] : uploadedFiles); // Allow only one video, multiple images
      } else {
        setFiles([]);
        setIsVideo(false);
      }
    }
  };

  // Handle status selection
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as 'onTime' | 'late');
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (files.length === 0) {
      setMessage('Please upload at least one image or a video.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    const endpoint = isVideo ? '/api/facial_recognition/mark/video/' : '/api/facial_recognition/mark/';
    
    if (isVideo) {
      formData.append('video', files[0]); // Single video file
    } else {
      files.forEach((file) => formData.append('images', file)); // Multiple images
    }
    formData.append('status', status);

    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Attendance marked successfully! ${response.data.message}`);
      setFiles([]);
      setIsVideo(false);
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

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Upload Classroom Images or Video:</label>
        <input
          type="file"
          multiple={!isVideo} // Allow multiple files only for images
          accept="image/*,video/*" // Accept both images and videos
          onChange={handleFileChange}
          className="text-gray-100 bg-gray-700 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{isVideo ? 'Selected Video:' : 'Selected Images:'}</h3>
          {isVideo ? (
            <video
              src={URL.createObjectURL(files[0])}
              controls
              className="rounded-md max-w-full h-auto"
              style={{ maxHeight: '300px' }}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt="Classroom Preview"
                  className="rounded-md mr-2"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || files.length === 0}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-500"
      >
        AttendAI
      </button>
    </div>
  );
};

export default MarkAttendance;