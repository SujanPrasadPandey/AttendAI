// // frontend/src/pages/admin/AdminDashboard.tsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Pie } from 'react-chartjs-2';
// import apiClient from '../../utils/api'; // Adjust path
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend);

// const AdminDashboard: React.FC = () => {
//   const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
//   const [students, setStudents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch classes on mount
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const response = await apiClient.get('/api/school_data/classes/');
//         setClasses(response.data);
//       } catch (error) {
//         console.error('Error fetching classes:', error);
//       }
//     };
//     fetchClasses();
//   }, []);

//   // Fetch attendance and students when filters are applied
//   const fetchData = async () => {
//     if (!selectedClass || !selectedDate) return;
//     setLoading(true);
//     try {
//       const [attendanceRes, studentsRes] = await Promise.all([
//         apiClient.get(`/api/attendance/records/?date=${selectedDate}&school_class=${selectedClass}`),
//         apiClient.get(`/api/users/admin/users/?role=student&school_class=${selectedClass}`),
//       ]);
//       setAttendanceRecords(attendanceRes.data);
//       setStudents(studentsRes.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle status updates
//   const handleStatusChange = async (studentId: number, newStatus: string, recordId?: number) => {
//     try {
//       if (recordId) {
//         await apiClient.patch(`/api/attendance/records/${recordId}/`, { status: newStatus });
//       } else {
//         await apiClient.post('/api/attendance/records/', {
//           student: studentId,
//           date: selectedDate,
//           status: newStatus,
//         });
//       }
//       fetchData(); // Refresh data
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   };

//   // Prepare pie chart data
//   const statusCounts = attendanceRecords.reduce((acc, record) => {
//     acc[record.status] = (acc[record.status] || 0) + 1;
//     return acc;
//   }, { present: 0, late: 0, absent: 0, leave: 0 });

//   const pieData = {
//     labels: ['Present', 'Late', 'Absent', 'Leave'],
//     datasets: [
//       {
//         data: [statusCounts.present, statusCounts.late, statusCounts.absent, statusCounts.leave],
//         backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3'],
//       },
//     ],
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
//       <div className="mb-4 flex space-x-4">
//         <div>
//           <label htmlFor="class-select" className="mr-2">Class:</label>
//           <select
//             id="class-select"
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="border p-2"
//           >
//             <option value="">Select Class</option>
//             {classes.map((cls) => (
//               <option key={cls.id} value={cls.id}>{cls.name}</option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label htmlFor="date-select" className="mr-2">Date:</label>
//           <input
//             id="date-select"
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="border p-2"
//           />
//         </div>
//         <button
//           onClick={fetchData}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Fetch Data
//         </button>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <>
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold mb-2">Attendance Overview</h3>
//             <div className="max-w-xs mx-auto">
//               <Pie data={pieData} />
//             </div>
//           </div>
//           <div>
//             <h3 className="text-xl font-semibold mb-2">Students</h3>
//             <table className="min-w-full border-collapse">
//               <thead>
//                 <tr>
//                   <th className="border px-4 py-2">Photo</th>
//                   <th className="border px-4 py-2">Name</th>
//                   <th className="border px-4 py-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {students.map((student) => {
//                   const attendance = attendanceRecords.find((record) => record.student === student.id);
//                   return (
//                     <tr key={student.id}>
//                       <td className="border px-4 py-2">
//                         <img
//                           src={student.profile_picture || '/default-profile.png'}
//                           alt="Profile"
//                           className="w-10 h-10 rounded-full"
//                         />
//                       </td>
//                       <td className="border px-4 py-2">
//                         <Link to={`/admin/students/${student.id}`} className="text-blue-500 hover:underline">
//                           {student.first_name} {student.last_name}
//                         </Link>
//                       </td>
//                       <td className="border px-4 py-2">
//                         <select
//                           value={attendance ? attendance.status : ''}
//                           onChange={(e) => handleStatusChange(student.id, e.target.value, attendance?.id)}
//                           className="border p-1"
//                         >
//                           <option value="">Select Status</option>
//                           <option value="present">Present</option>
//                           <option value="late">Late</option>
//                           <option value="absent">Absent</option>
//                           <option value="leave">Leave</option>
//                         </select>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;