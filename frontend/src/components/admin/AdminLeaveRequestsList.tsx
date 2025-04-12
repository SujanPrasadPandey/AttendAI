import React, { useState } from "react";
import apiClient from "../../utils/api";

interface LeaveRequest {
  id: number;
  student: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  admin_comment: string | null;
}

interface AdminLeaveRequestsListProps {
  requests: LeaveRequest[];
}

const AdminLeaveRequestsList: React.FC<AdminLeaveRequestsListProps> = ({
  requests,
}) => {
  const [comment, setComment] = useState<string>("");

  const handleAction = async (id: number, action: "approve" | "deny") => {
    try {
      await apiClient.put(`/api/leave_requests/update/${id}/`, {
        action,
        admin_comment: comment,
      });
      window.location.reload(); // Simple refresh; consider state management for production
    } catch (err) {
      console.error("Failed to update leave request:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Leave Requests</h2>
      {requests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="p-4 border rounded">
              <p>
                <strong>Student ID:</strong> {request.student}
              </p>
              <p>
                <strong>Start Date:</strong> {request.start_date}
              </p>
              <p>
                <strong>End Date:</strong> {request.end_date}
              </p>
              <p>
                <strong>Reason:</strong> {request.reason}
              </p>
              <p>
                <strong>Status:</strong> {request.status}
              </p>
              {request.status === "pending" && (
                <div className="mt-2">
                  <textarea
                    placeholder="Optional comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={() => handleAction(request.id, "approve")}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(request.id, "deny")}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Deny
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminLeaveRequestsList;