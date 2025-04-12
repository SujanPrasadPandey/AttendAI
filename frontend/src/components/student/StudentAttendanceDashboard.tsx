// src/components/student/StudentAttendanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions, // Import ChartOptions type
    ChartData   // Import ChartData type
} from 'chart.js';

// Register Chart.js components required for Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

// Interfaces
interface AttendanceRecord {
  date: string;
  status: 'present' | 'late' | 'absent' | 'leave';
}

interface AttendanceMap {
  [date: string]: string; // Maps date string "YYYY-MM-DD" to status string
}

// --- Configuration ---

// Define status colors (using hex for direct style application)
const statusColors: Record<string, string> = {
  present: '#10B981', // Tailwind green-500
  late: '#F59E0B',    // Tailwind yellow-500
  absent: '#EF4444',  // Tailwind red-500
  leave: '#3B82F6',   // Tailwind blue-500
};

// Define text colors for contrast against status backgrounds
// Ensure these provide good readability against the corresponding statusColors
const statusTextColors: Record<string, string> = {
  present: 'text-white',
  late: 'text-gray-900', // Dark text on yellow
  absent: 'text-white',
  leave: 'text-white',
};

// Default colors for days without status (applied via Tailwind classes)
const defaultDayClasses = 'bg-white dark:bg-gray-700'; // Background
const defaultTextClasses = 'text-gray-700 dark:text-gray-300'; // Text

// --- Component ---

const StudentAttendanceDashboard: React.FC<{ studentId: number }> = ({ studentId }) => {
  // --- State ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [error, setError] = useState<string | null>(null); // Error message state

  // --- Date Calculations ---
  const selectedMonth = selectedDate.getMonth(); // 0-indexed (0 = January)
  const selectedYear = selectedDate.getFullYear();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate(); // Get last day of the month
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, ...

  // --- Data Fetching ---
  const fetchAttendance = async () => {
    setLoading(true); // Indicate loading start
    setError(null);   // Clear previous errors
    // Format dates for API query (YYYY-MM-DD)
    const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    try {
      const response = await apiClient.get(`/api/attendance/students/${studentId}/records/`, {
        params: { date__gte: startDate, date__lte: endDate }, // Use backend filtering
      });
      const records: AttendanceRecord[] = response.data;
      // Convert array of records into a map for easy lookup by date
      const map: AttendanceMap = {};
      records.forEach(record => {
        map[record.date] = record.status;
      });
      setAttendanceMap(map); // Update state with fetched data
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      // Provide a user-friendly error message
      setError('Unable to load attendance data. Please check your connection or permissions.');
      setAttendanceMap({}); // Clear data on error
    } finally {
      setLoading(false); // Indicate loading finished
    }
  };

  // Effect to fetch data when studentId or selectedDate changes
  useEffect(() => {
    if (studentId) { // Only fetch if studentId is valid
        fetchAttendance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, studentId]); // Re-run effect if date or student changes

  // --- Calendar Generation ---
  // Create an array representing the calendar grid cells
  const calendarDays: (number | null)[] = [];
  // Add null placeholders for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Add actual day numbers
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  // Add null placeholders to fill the last week(s) if needed, ensuring 6 rows (42 cells)
  while (calendarDays.length < 42) {
    calendarDays.push(null);
  }

  // --- Pie Chart Data & Options ---
  // Calculate counts for each attendance status
  const statusCounts = Object.values(attendanceMap).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>); // Initialize with empty object, typed

  // Structure data for Chart.js Pie chart
  const pieData: ChartData<'pie'> = {
    labels: ['Present', 'Late', 'Absent', 'Leave'],
    datasets: [
      {
        label: 'Attendance Status', // Added a label for the dataset
        data: [
          statusCounts['present'] || 0,
          statusCounts['late'] || 0,
          statusCounts['absent'] || 0,
          statusCounts['leave'] || 0,
        ],
        backgroundColor: [ // Use defined status colors
          statusColors.present,
          statusColors.late,
          statusColors.absent,
          statusColors.leave,
        ],
        borderColor: [ // Add border for better segment visibility (especially in dark mode)
           '#ffffff', // White border
           '#ffffff',
           '#ffffff',
           '#ffffff',
        ],
        borderWidth: 1.5, // Slightly thicker border
      },
    ],
  };

  // Configure Pie chart options
  const pieOptions: ChartOptions<'pie'> = {
    responsive: true, // Make chart responsive to container size
    maintainAspectRatio: false, // Allow chart aspect ratio to change
    plugins: {
      legend: {
        position: 'top' as const, // Position legend at the top
        labels: {
            // Dynamically set label color based on current theme
            color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151', // Gray-200 (dark) or Gray-700 (light)
            padding: 15, // Add padding to legend items
        }
      },
      tooltip: {
        callbacks: {
          // Customize tooltip label format
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            // Calculate percentage
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0; // One decimal place
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

   // Effect to update legend color if theme changes dynamically
   // Note: This might require a chart redraw/update for robustness in some scenarios
   useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
           // Update the default legend color - may need chart.update() if instance is available
           ChartJS.defaults.plugins.legend.labels.color = document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151';
           // Consider forcing a re-render or directly updating the chart instance if needed
        }
      });
    });
    // Observe changes to the class attribute of the root element
    observer.observe(document.documentElement, { attributes: true });
    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);


  // --- Event Handlers ---
  const handlePrevMonth = () => setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
  const handleNextMonth = () => setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));

  // --- Render ---
  return (
    // Main container with padding, background colors, and shadow
    <div className="p-4 md:p-6 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg shadow-md">

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded shadow transition duration-150 ease-in-out"
        >
            &lt; Prev
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button
            onClick={handleNextMonth}
            aria-label="Next month"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded shadow transition duration-150 ease-in-out"
        >
            Next &gt;
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Loading attendance data...
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded-md relative my-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Calendar and Summary - Only show when not loading and no critical error */}
      {!loading && (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px mb-6 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600"> {/* Use gap-px for cell borders */}
              {/* Calendar Header Row */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold p-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 uppercase tracking-wider">
                  {day}
                </div>
              ))}

              {/* Calendar Day Cells */}
              {calendarDays.map((day, index) => {
                // Render empty cells for padding days
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-20 sm:h-24 bg-gray-50 dark:bg-gray-800/30" />; // Slightly different background for empty cells
                }

                // Date string for lookup in attendanceMap
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const status = attendanceMap[dateStr]; // Get status or undefined
                const isToday = new Date().toDateString() === new Date(selectedYear, selectedMonth, day).toDateString();

                // --- Determine Cell Styling ---
                let cellClasses = 'h-20 sm:h-24 p-1 sm:p-2 flex items-center justify-center relative transition-colors duration-150 ease-in-out'; // Base classes
                let textClasses = 'font-medium text-sm sm:text-base'; // Base text classes
                let cellStyle = {}; // Style attribute primarily for status background color

                if (isToday) {
                    // Add a ring indicator for the current day
                    cellClasses += ' ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900 z-10';
                }

                if (status) {
                    // Day WITH status: Apply specific background color via style, and text color via class
                    cellStyle = { backgroundColor: statusColors[status] };
                    textClasses += ` ${statusTextColors[status]}`; // Add status-specific text color class
                } else {
                    // Day WITHOUT status: Apply default background and text colors using classes
                    cellClasses += ` ${defaultDayClasses}`;   // e.g., ' bg-white dark:bg-gray-700'
                    textClasses += ` ${defaultTextClasses}`; // e.g., ' text-gray-700 dark:text-gray-300'
                }
                // --- End Determine Cell Styling ---

                return (
                  <div
                    key={`day-${day}-${index}`} // More unique key
                    className={cellClasses}    // Apply calculated classes
                    style={cellStyle}          // Apply background style only if status exists
                  >
                    <span className={textClasses}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div> {/* End Calendar Grid */}

            {/* --- Attendance Summary Section --- */}
            {/* Show summary only if there's data or no error preventing display */}
            {!error && (
                <div className="flex flex-col md:flex-row items-center md:items-start justify-around gap-6 md:gap-8 mt-8">
                    {/* Pie Chart */}
                    <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Attendance Summary</h3>
                        <div className="relative w-full h-64 sm:h-72"> {/* Container with fixed height */}
                            {Object.values(statusCounts).some(count => count > 0) ? (
                                <Pie data={pieData} options={pieOptions} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center px-4">
                                    No attendance data recorded for this month.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="w-full md:w-auto flex flex-col items-center md:items-start mt-6 md:mt-0">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Legend</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
                            {/* Map through defined statuses */}
                            {Object.entries(statusColors).map(([status, color]) => (
                            <div key={status} className="flex items-center">
                                <div className="w-4 h-4 rounded-sm mr-2 border border-gray-300 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: color }} />
                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                            </div>
                            ))}
                            {/* Add legend item for default/no record */}
                            <div key="no-record" className="flex items-center">
                                <div className={`w-4 h-4 rounded-sm mr-2 border border-gray-300 dark:border-gray-500 flex-shrink-0 ${defaultDayClasses.split(' ')[0]} dark:${defaultDayClasses.split(' ')[1]}`} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">No Record</span>
                            </div>
                            {/* Add legend item for 'Today' indicator */}
                            <div key="today" className="flex items-center">
                                <div className="w-4 h-4 rounded-sm mr-2 border-2 border-blue-500 dark:border-blue-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Today</span>
                            </div>
                        </div>
                    </div>
                </div>
             )} {/* End Summary Section conditional render */}
          </>
        )} {/* End of conditional rendering block for !loading */}
    </div> // End of main container
  );
};

export default StudentAttendanceDashboard;