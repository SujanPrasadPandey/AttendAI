// src/pages/common/UnrecognizedFaces.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface UnrecognizedFace {
  id: number;
  image: string;
  timestamp: string;
  identified_student: number | null;
  identified_student_name: string | null;
  discarded: boolean;
}

interface Student {
  id: number;
  user: { username: string };
}

const UnrecognizedFaces: React.FC = () => {
  const [faces, setFaces] = useState<UnrecognizedFace[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned' | 'discarded'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<{ [key: number]: number | null }>({});

  // Fetch unrecognized faces and students on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facesResponse, studentsResponse] = await Promise.all([
          apiClient.get('/api/facial_recognition/unrecognized/list/'),
          apiClient.get('/api/school_data/studentprofiles/'),
        ]);
        setFaces(facesResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        setMessage('Failed to load data.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle student selection for assignment
  const handleStudentChange = (faceId: number, studentId: string) => {
    setSelectedStudentIds((prev) => ({
      ...prev,
      [faceId]: studentId === '' ? null : Number(studentId),
    }));
  };

  // Assign face to a student
  const handleAssign = async (faceId: number) => {
    const studentId = selectedStudentIds[faceId];
    if (studentId === undefined || studentId === null) {
      setMessage('Please select a student to assign.');
      return;
    }
    try {
      await apiClient.post('/api/facial_recognition/unrecognized/assign/', {
        face_id: faceId,
        student_id: studentId,
      });
      setFaces((prev) => prev.filter((face) => face.id !== faceId));
      setSelectedStudentIds((prev) => {
        const newState = { ...prev };
        delete newState[faceId];
        return newState;
      });
      setMessage('Face assigned successfully.');
    } catch (error) {
      setMessage('Failed to assign face.');
      console.error('Error:', error);
    }
  };

  // Filter faces based on selected filter
  const filteredFaces = faces.filter((face) => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return face.identified_student === null && !face.discarded;
    if (filter === 'assigned') return face.identified_student !== null;
    if (filter === 'discarded') return face.discarded;
    return false;
  });

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Unrecognized Faces</h1>
      {loading && <p className="text-blue-400">Loading...</p>}
      {message && (
        <p className={message.includes('Failed') ? 'text-red-500' : 'text-green-500'}>{message}</p>
      )}

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unassigned')}
          className={`px-4 py-2 rounded ${filter === 'unassigned' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          Unassigned
        </button>
        <button
          onClick={() => setFilter('assigned')}
          className={`px-4 py-2 rounded ${filter === 'assigned' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          Assigned
        </button>
        <button
          onClick={() => setFilter('discarded')}
          className={`px-4 py-2 rounded ${filter === 'discarded' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          Discarded
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaces.map((face) => (
          <div key={face.id} className="bg-gray-800 p-4 rounded-lg">
            <img
              src={face.image}
              alt="Unrecognized Face"
              className="w-full h-40 object-contain rounded mb-2"
            />
            <p className="text-sm mb-2">{new Date(face.timestamp).toLocaleString()}</p>
            {face.identified_student_name && (
              <p className="text-sm mb-2">Assigned to: {face.identified_student_name}</p>
            )}
            {face.discarded && (
              <p className="text-sm mb-2 text-red-500">Discarded</p>
            )}
            {!face.identified_student && !face.discarded && (
              <>
                <select
                  value={selectedStudentIds[face.id] ?? ''}
                  onChange={(e) => handleStudentChange(face.id, e.target.value)}
                  className="w-full p-2 bg-gray-700 text-gray-100 rounded mb-2"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user.username}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssign(face.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Assign
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnrecognizedFaces;