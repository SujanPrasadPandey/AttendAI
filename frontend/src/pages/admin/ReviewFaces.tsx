// src/pages/admin/ReviewFaces.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface ReviewFace {
  id: number;
  image: string;
  similarity: number;
  timestamp: string;
  suggested_student: number;
  suggested_student_name: string;
  confirmed_student: number | null;
  confirmed_student_name: string | null;
  discarded: boolean;
}

interface Student {
  id: number;
  user: { username: string };
}

const ReviewFaces: React.FC = () => {
  const [faces, setFaces] = useState<ReviewFace[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'discarded'>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<{ [key: number]: number | null }>({});

  // Fetch review faces and students on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facesResponse, studentsResponse] = await Promise.all([
          apiClient.get('/api/facial_recognition/review/list/'),
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

  // Handle student selection for reassignment
  const handleStudentChange = (faceId: number, studentId: string) => {
    setSelectedStudentIds((prev) => ({
      ...prev,
      [faceId]: studentId === '' ? null : Number(studentId),
    }));
  };

  // Handle confirm, reassign, or discard actions
  const handleAction = async (
    faceId: number,
    action: 'confirm' | 'reassign' | 'discard'
  ) => {
    const payload: { face_id: number; action: string; confirmed_student_id?: number } = {
      face_id: faceId,
      action,
    };
    if (action === 'reassign') {
      const studentId = selectedStudentIds[faceId];
      if (!studentId) {
        setMessage('Please select a student for reassignment.');
        return;
      }
      payload.confirmed_student_id = studentId;
    } else if (action === 'confirm') {
      const face = faces.find((f) => f.id === faceId);
      if (face) {
        payload.confirmed_student_id = face.suggested_student;
      }
    }

    try {
      await apiClient.post('/api/facial_recognition/review/confirm/', payload);
      setFaces((prev) => prev.filter((face) => face.id !== faceId));
      setSelectedStudentIds((prev) => {
        const newState = { ...prev };
        delete newState[faceId];
        return newState;
      });
      setMessage(`${action.charAt(0).toUpperCase() + action.slice(1)}ed successfully.`);
    } catch (error) {
      setMessage(`Failed to ${action} face.`);
      console.error('Error:', error);
    }
  };

  // Filter faces based on selected filter
  const filteredFaces = faces.filter((face) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return face.confirmed_student === null && !face.discarded;
    if (filter === 'reviewed') return face.confirmed_student !== null;
    if (filter === 'discarded') return face.discarded;
    return false;
  });

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Review Faces</h1>
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`px-4 py-2 rounded ${filter === 'reviewed' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          Reviewed
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
              alt="Review Face"
              className="w-full h-40 object-contain rounded mb-2"
            />
            <p className="text-sm mb-2">
              Suggested: {face.suggested_student_name} (Similarity: {face.similarity.toFixed(2)})
            </p>
            {face.confirmed_student_name && (
              <p className="text-sm mb-2">Confirmed: {face.confirmed_student_name}</p>
            )}
            {face.discarded && (
              <p className="text-sm mb-2 text-red-500">Discarded</p>
            )}
            <p className="text-sm mb-2">{new Date(face.timestamp).toLocaleString()}</p>
            {!face.confirmed_student && !face.discarded && (
              <>
                <select
                  value={selectedStudentIds[face.id] ?? ''}
                  onChange={(e) => handleStudentChange(face.id, e.target.value)}
                  className="w-full p-2 bg-gray-700 text-gray-100 rounded mb-2"
                >
                  <option value="">Reassign to...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user.username}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(face.id, 'confirm')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleAction(face.id, 'reassign')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => handleAction(face.id, 'discard')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Discard
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewFaces;