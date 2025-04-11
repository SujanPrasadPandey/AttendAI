import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../../utils/api";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../components/custom-datepicker.css"

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to get Tailwind CSS classes based on attendance status for the colored dropdown (when not focused)
const getStatusClasses = (status: string) => {
  switch (status) {
    case "present":
      return "bg-green-500 text-white";
    case "absent":
      return "bg-red-500 text-white";
    case "late":
      return "bg-yellow-500 text-black";
    case "leave":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-700 text-gray-100";
  }
};

interface User {
  id: number;
  username: string;
  email: string | null;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

interface Student {
  id: number;
  user: User;
  school_class: { id: number; name: string; grade_level: number } | null;
  roll_number: string;
  address: string;
}

interface Attendance {
  id?: number;
  student: number;
  status: string;
}

// A dedicated dropdown for attendance status that uses neutral styling when open
interface AttendanceDropdownProps {
  value: string;
  onChange: (status: string) => void;
}
const AttendanceDropdown: React.FC<AttendanceDropdownProps> = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const neutralClasses = "bg-gray-800 text-gray-100";
  const dropdownClasses = !isFocused ? getStatusClasses(value) : neutralClasses;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`p-2 rounded-md w-full focus:outline-none ${dropdownClasses}`}
    >
      <option value="" disabled>
        Select
      </option>
      <option value="present">Present</option>
      <option value="late">Late</option>
      <option value="absent">Absent</option>
      <option value="leave">Leave Approved</option>
    </select>
  );
};

const ManageAttendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<string>(
    localStorage.getItem("selectedClass") || ""
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const storedDate = localStorage.getItem("selectedDate");
    return storedDate ? new Date(storedDate) : new Date();
  });
  const [classes, setClasses] = useState<{ id: number; name: string; grade_level: number }[]>([]);

  // New states for sorting and grouping the attendance list
  const [groupByStatus, setGroupByStatus] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("username"); // Options: username, first_name, or attendance
  const [sortOrder, setSortOrder] = useState<string>("asc");

  // Fetch classes
  useEffect(() => {
    apiClient
      .get("/api/school_data/classes/")
      .then((response) => setClasses(response.data))
      .catch((err) => console.error("Error fetching classes:", err));
  }, []);

  // Fetch students and attendance records when class or date changes
  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    if (selectedClass && formattedDate) {
      setLoading(true);
      Promise.all([
        apiClient.get(`/api/school_data/studentprofiles/?school_class=${selectedClass}`),
        apiClient.get(`/api/attendance/records/?school_class=${selectedClass}&date=${formattedDate}`),
      ])
        .then(([studentsResponse, attendanceResponse]) => {
          setStudents(studentsResponse.data);
          setAttendanceRecords(attendanceResponse.data || []);
        })
        .catch((err) => console.error("Error fetching data:", err))
        .finally(() => setLoading(false));
    }
  }, [selectedClass, selectedDate]);

  // Persist class and date selections in localStorage
  useEffect(() => {
    if (selectedClass) localStorage.setItem("selectedClass", selectedClass);
    localStorage.setItem("selectedDate", selectedDate.toISOString());
  }, [selectedClass, selectedDate]);

  // Create a map for quick attendance record lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<number, Attendance>();
    attendanceRecords.forEach((record) => map.set(record.student, record));
    return map;
  }, [attendanceRecords]);

  // Attendance statistics for pie chart
  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, leave: 0 };
    attendanceRecords.forEach((record) => {
      if (record.status === "present") stats.present++;
      else if (record.status === "absent") stats.absent++;
      else if (record.status === "late") stats.late++;
      else if (record.status === "leave") stats.leave++;
    });
    return stats;
  }, [attendanceRecords]);

  const pieData = {
    labels: ["Present", "Absent", "Late", "Leave Approved"],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late, attendanceStats.leave],
        backgroundColor: ["#A6E3A1", "#F38BA8", "#FAB387", "#89B4FA"],
      },
    ],
  };

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lowerSearch = searchTerm.toLowerCase();
    return students.filter((student) =>
      student.user.username.toLowerCase().includes(lowerSearch) ||
      (student.user.email && student.user.email.toLowerCase().includes(lowerSearch)) ||
      student.user.first_name.toLowerCase().includes(lowerSearch) ||
      student.user.last_name.toLowerCase().includes(lowerSearch)
    );
  }, [students, searchTerm]);

  // Sorting the students list based on the chosen criteria.
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...filteredStudents];
    studentsCopy.sort((a, b) => {
      let aField: string = "";
      let bField: string = "";
      if (sortBy === "username") {
        aField = a.user.username;
        bField = b.user.username;
      } else if (sortBy === "first_name") {
        aField = a.user.first_name;
        bField = b.user.first_name;
      } else if (sortBy === "attendance") {
        aField = (attendanceMap.get(a.id)?.status || "none").toLowerCase();
        bField = (attendanceMap.get(b.id)?.status || "none").toLowerCase();
      }
      if (sortOrder === "asc") {
        return aField.localeCompare(bField);
      } else {
        return bField.localeCompare(aField);
      }
    });
    return studentsCopy;
  }, [filteredStudents, sortBy, sortOrder, attendanceMap]);

  // Group the sorted students by attendance status
  const groupedStudents = useMemo(() => {
    // Define a group order for consistency
    const order = ["present", "absent", "late", "leave", "none"];
    const groups: Record<string, Student[]> = {};
    // Initialize groups
    order.forEach((group) => {
      groups[group] = [];
    });
    sortedStudents.forEach((student) => {
      const status = (attendanceMap.get(student.id)?.status || "none").toLowerCase();
      groups[status].push(student);
    });
    return groups;
  }, [sortedStudents, attendanceMap]);

  // Update attendance status function remains the same.
  const handleStatusChange = async (studentId: number, status: string) => {
    try {
      const existingRecord = attendanceRecords.find((record) => record.student === studentId);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const data = {
        student: studentId,
        school_class: selectedClass,
        date: formattedDate,
        status,
      };

      if (existingRecord) {
        await apiClient.put(`/api/attendance/records/${existingRecord.id}/`, data);
        setAttendanceRecords((prev) =>
          prev.map((record) => (record.id === existingRecord.id ? { ...record, status } : record))
        );
      } else {
        const response = await apiClient.post(`/api/attendance/records/`, data);
        setAttendanceRecords((prev) => [...prev, response.data]);
      }
    } catch (err) {
      console.error("Error updating or creating attendance:", err);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Manage Attendance</h2>

      {/* Pie Chart */}
      {selectedClass && selectedDate && (
        <div className="mb-6">
          <div className="w-64 h-64 mx-auto">
            <Pie data={pieData} />
          </div>
        </div>
      )}

      {/* Controls for Class, Date, Sorting, and Grouping */}
      <div className="mb-4 flex flex-col md:flex-row md:space-x-4 items-end">
        {/* Class Dropdown */}
        <div className="relative w-full md:w-1/3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block appearance-none w-full border border-gray-700 p-2 pr-8 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Grade {cls.grade_level})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
              <path d="M5.516 7.548l4.484 4.484 4.484-4.484L16 9l-6 6-6-6z" />
            </svg>
          </div>
        </div>
        {/* Date Picker */}
        <div className="w-full md:w-1/3">
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-700 p-2 rounded-md bg-gray-800 text-gray-100 w-full"
            calendarClassName="react-datepicker-custom"
            dayClassName={() => "react-datepicker-day-custom"}
          />
        </div>
        {/* Sorting Controls */}
        <div className="w-full md:w-1/3 flex flex-col space-y-2">
          <label className="text-gray-200 text-sm">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-700 p-2 rounded-md bg-gray-800 text-gray-100"
          >
            <option value="username">Username</option>
            <option value="first_name">First Name</option>
            <option value="attendance">Attendance Status</option>
          </select>
          <label className="text-gray-200 text-sm">Sort Order:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-700 p-2 rounded-md bg-gray-800 text-gray-100"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Toggle for grouping */}
      <div className="mb-6 flex items-center space-x-2">
        <input
          type="checkbox"
          id="groupToggle"
          checked={groupByStatus}
          onChange={(e) => setGroupByStatus(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <label htmlFor="groupToggle" className="text-gray-200">
          Group by Attendance Status
        </label>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-700 p-2 rounded-md w-full bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Students List */}
      {loading ? (
        <p className="text-gray-100">Loading...</p>
      ) : groupByStatus ? (
        // Grouped View by Attendance Status
        Object.entries(groupedStudents).map(([group, groupStudents]) => (
          <div key={group} className="mb-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-2 capitalize">
              {group === "none" ? "No Status Selected" : group} ({groupStudents.length})
            </h3>
            {groupStudents.length > 0 ? (
              <div className="overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">Photo</th>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">Username</th>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">Email</th>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">First Name</th>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">Last Name</th>
                      <th className="border border-gray-700 px-4 py-2 text-gray-100">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 text-gray-100">
                    {groupStudents.map((student) => {
                      const currentStatus = (attendanceMap.get(student.id)?.status) || "";
                      return (
                        <tr key={student.id} className="hover:bg-gray-800">
                          <td className="border border-gray-700 px-4 py-2">
                            <img
                              src={student.user.profile_picture || "/default-profile.png"}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </td>
                          <td className="border border-gray-700 px-4 py-2">{student.user.username}</td>
                          <td className="border border-gray-700 px-4 py-2">{student.user.email || "-"}</td>
                          <td className="border border-gray-700 px-4 py-2">{student.user.first_name || "-"}</td>
                          <td className="border border-gray-700 px-4 py-2">{student.user.last_name || "-"}</td>
                          <td className="border border-gray-700 px-4 py-2">
                            <AttendanceDropdown
                              value={currentStatus}
                              onChange={(status: string) => handleStatusChange(student.id, status)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300">No students found for this status.</p>
            )}
          </div>
        ))
      ) : (
        // Sorted but not grouped view (plain table)
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-800">
              <tr>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">Photo</th>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">Username</th>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">Email</th>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">First Name</th>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">Last Name</th>
                <th className="border border-gray-700 px-4 py-2 text-gray-100">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 text-gray-100">
              {sortedStudents.map((student) => {
                const currentStatus = (attendanceMap.get(student.id)?.status) || "";
                return (
                  <tr key={student.id} className="hover:bg-gray-800">
                    <td className="border border-gray-700 px-4 py-2">
                      <img
                        src={student.user.profile_picture || "/default-profile.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="border border-gray-700 px-4 py-2">{student.user.username}</td>
                    <td className="border border-gray-700 px-4 py-2">{student.user.email || "-"}</td>
                    <td className="border border-gray-700 px-4 py-2">{student.user.first_name || "-"}</td>
                    <td className="border border-gray-700 px-4 py-2">{student.user.last_name || "-"}</td>
                    <td className="border border-gray-700 px-4 py-2">
                      <AttendanceDropdown
                        value={currentStatus}
                        onChange={(status: string) => handleStatusChange(student.id, status)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageAttendance;
