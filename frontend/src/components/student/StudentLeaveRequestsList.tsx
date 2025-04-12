import React from "react";

// Interface for a single leave request
interface LeaveRequest {
  id: number;
  start_date: string; // Assuming format is readable, e.g., YYYY-MM-DD
  end_date: string;   // Assuming format is readable, e.g., YYYY-MM-DD
  reason: string;
  status: "pending" | "approved" | "denied";
  admin_comment: string | null;
}

// Props for the component
interface StudentLeaveRequestsListProps {
  requests: LeaveRequest[]; // An array of leave requests
}

const StudentLeaveRequestsList: React.FC<StudentLeaveRequestsListProps> = ({
  requests,
}) => {
  // Helper function to format date strings if needed (optional)
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString(); // Example formatting
  // };

  return (
    // Apply base dark mode text color for content within this div
    <div className="dark:text-gray-200">
      {/* Heading with dark mode text color */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Your Leave Requests
      </h2>

      {/* Conditional rendering: Show message if no requests */}
      {requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No leave requests found.
        </p>
      ) : (
        // List container
        <ul className="space-y-4">
          {/* Map through requests and render a list item for each */}
          {requests.map((request) => (
            <li
              key={request.id}
              // List item styling: background, border, padding, rounding for both light and dark modes
              className="p-4 border border-gray-200 rounded bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              {/* Request details - using paragraphs with margin-bottom for spacing */}
              <p className="mb-1">
                <strong className="font-medium text-gray-700 dark:text-gray-300">Start Date:</strong>{" "}
                {/* Consider formatting: formatDate(request.start_date) */}
                {request.start_date}
              </p>
              <p className="mb-1">
                <strong className="font-medium text-gray-700 dark:text-gray-300">End Date:</strong>{" "}
                {/* Consider formatting: formatDate(request.end_date) */}
                {request.end_date}
              </p>
              <p className="mb-1">
                <strong className="font-medium text-gray-700 dark:text-gray-300">Reason:</strong>{" "}
                {request.reason}
              </p>
              <p className="mb-1">
                <strong className="font-medium text-gray-700 dark:text-gray-300">Status:</strong>{" "}
                {/* Status badge with conditional styling */}
                <span
                  className={`capitalize px-2 py-0.5 rounded text-xs font-medium ml-1 ${ // Added ml-1 for spacing
                    request.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" // Approved colors
                      : request.status === "denied"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"       // Denied colors
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" // Pending colors
                  }`}
                >
                  {request.status}
                </span>
              </p>
              {/* Conditionally display Admin Comment */}
              {request.admin_comment && (
                <p className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"> {/* Added top border */}
                  <strong className="font-medium text-gray-700 dark:text-gray-300">Admin Comment:</strong>{" "}
                  {request.admin_comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentLeaveRequestsList;