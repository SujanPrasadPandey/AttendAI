import React, { useState } from "react";
import apiClient from "../../utils/api"; // Ensure path is correct

// Interface for a single leave request
interface LeaveRequest {
  id: number;
  student: number; // Assuming this is an ID, consider fetching student details for display name
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  admin_comment: string | null;
}

// Props for the component
interface AdminLeaveRequestsListProps {
  // Pass requests and potentially a function to update state after action
  requests: LeaveRequest[];
  onUpdateRequest?: (updatedRequest: LeaveRequest) => void; // Optional callback for better state management
}

const AdminLeaveRequestsList: React.FC<AdminLeaveRequestsListProps> = ({
  requests,
  onUpdateRequest, // Use this callback if provided
}) => {
  // State to hold comments for each request ID
  const [comments, setComments] = useState<Record<number, string>>({});
  // State to track loading status for each request ID and action type
  const [loadingStates, setLoadingStates] = useState<Record<number, 'approve' | 'deny' | null>>({});
   // State for potential errors during action
  const [actionError, setActionError] = useState<Record<number, string | null>>({});

  // Handler for comment changes
  const handleCommentChange = (id: number, value: string) => {
    setComments((prev) => ({ ...prev, [id]: value }));
     // Clear error for this item when user types
    setActionError((prev) => ({ ...prev, [id]: null }));
  };

  // Handler for approve/deny actions
  const handleAction = async (id: number, action: "approve" | "deny") => {
    setLoadingStates((prev) => ({ ...prev, [id]: action })); // Set loading state for this item/action
    setActionError((prev) => ({ ...prev, [id]: null })); // Clear previous error for this item

    const requestComment = comments[id] || ""; // Get comment for this specific request

    try {
      const response = await apiClient.put(`/api/leave_requests/update/${id}/`, { // Ensure endpoint is correct
        action,
        admin_comment: requestComment, // Send specific comment
      });

      // --- State Update Logic ---
      if (onUpdateRequest) {
        // If callback provided, use it to update parent state (preferred)
        onUpdateRequest(response.data); // Assuming API returns the updated request
      } else {
        // Fallback: Reload the page (simpler but less smooth UX)
        console.warn("Consider providing an onUpdateRequest callback for smoother UI updates.");
        window.location.reload();
      }
       // Clear comment for the processed request
      setComments((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
      });


    } catch (err: any) {
      console.error(`Failed to ${action} leave request ${id}:`, err);
       setActionError((prev) => ({
            ...prev,
            [id]: err.response?.data?.detail || `Failed to ${action} request. Please try again.`
       }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: null })); // Clear loading state for this item
    }
  };

  // Common input styles (similar to the form)
  const inputStyles = `
    w-full p-2 border rounded text-sm
    bg-white text-gray-900 placeholder-gray-500
    border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
    dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
    dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500
  `;

  // Base button styles
  const baseButtonStyles = `
    px-3 py-1.5 rounded text-white text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Specific button styles
  const approveButtonStyles = `bg-green-600 hover:bg-green-700 focus:ring-green-500`;
  const denyButtonStyles = `bg-red-600 hover:bg-red-700 focus:ring-red-500`;

  return (
     // Base dark mode text color
    <div className="dark:text-gray-200">
      {/* Heading */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        All Leave Requests
      </h2>

      {/* Empty state message */}
      {requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No leave requests found.
        </p>
      ) : (
        // List container
        <ul className="space-y-4">
          {requests.map((request) => {
            const isLoadingApprove = loadingStates[request.id] === 'approve';
            const isLoadingDeny = loadingStates[request.id] === 'deny';
            const isProcessing = isLoadingApprove || isLoadingDeny;
            const currentError = actionError[request.id];

            return (
              <li
                key={request.id}
                // List item styling
                className="p-4 border border-gray-200 rounded bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                {/* Request Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-2"> {/* Grid layout for details */}
                    <p>
                    <strong className="font-medium text-gray-700 dark:text-gray-300">Student ID:</strong>{" "}
                    {request.student}
                    </p>
                     <p>
                        <strong className="font-medium text-gray-700 dark:text-gray-300">Status:</strong>{" "}
                        {/* Status badge */}
                        <span
                        className={`capitalize px-2 py-0.5 rounded text-xs font-medium ml-1 ${
                            request.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : request.status === "denied"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                        >
                        {request.status}
                        </span>
                    </p>
                    <p>
                    <strong className="font-medium text-gray-700 dark:text-gray-300">Start Date:</strong>{" "}
                    {request.start_date}
                    </p>
                    <p>
                    <strong className="font-medium text-gray-700 dark:text-gray-300">End Date:</strong>{" "}
                    {request.end_date}
                    </p>
                    <p className="sm:col-span-2"> {/* Reason spanning two columns */}
                    <strong className="font-medium text-gray-700 dark:text-gray-300">Reason:</strong>{" "}
                    {request.reason}
                    </p>
                    {/* Display existing admin comment if request is not pending */}
                     {request.status !== 'pending' && request.admin_comment && (
                        <p className="sm:col-span-2 mt-1 italic text-sm text-gray-600 dark:text-gray-400">
                            <strong className="font-medium text-gray-700 dark:text-gray-300">Admin Comment:</strong>{" "}
                            {request.admin_comment}
                        </p>
                     )}
                </div>


                {/* Action section for pending requests */}
                {request.status === "pending" && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <label htmlFor={`comment-${request.id}`} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        Add Comment (Optional)
                    </label>
                    <textarea
                      id={`comment-${request.id}`} // Unique ID
                      placeholder="Provide feedback or reason for action..."
                      value={comments[request.id] || ""} // Use state for this specific request
                      onChange={(e) => handleCommentChange(request.id, e.target.value)}
                      className={`${inputStyles} mb-2`} // Apply input styles
                      rows={2} // Smaller height
                      disabled={isProcessing} // Disable if currently processing
                    />
                    {/* Display error specific to this item */}
                    {currentError && (
                         <p className="text-sm text-red-600 dark:text-red-400 mb-2">{currentError}</p>
                    )}
                    <div className="flex items-center space-x-2"> {/* Flex container for buttons */}
                      <button
                        onClick={() => handleAction(request.id, "approve")}
                        className={`${baseButtonStyles} ${approveButtonStyles}`}
                        disabled={isProcessing} // Disable both if either action is loading
                      >
                         {isLoadingApprove ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(request.id, "deny")}
                        className={`${baseButtonStyles} ${denyButtonStyles}`}
                        disabled={isProcessing} // Disable both if either action is loading
                      >
                         {isLoadingDeny ? "Denying..." : "Deny"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminLeaveRequestsList;