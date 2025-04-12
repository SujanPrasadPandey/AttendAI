import React from "react";

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  admin_comment: string | null;
}

interface StudentLeaveRequestsListProps {
  requests: LeaveRequest[];
}

const StudentLeaveRequestsList: React.FC<StudentLeaveRequestsListProps> = ({
  requests,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Leave Requests</h2>
      {requests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="p-4 border rounded">
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
              {request.admin_comment && (
                <p>
                  <strong>Admin Comment:</strong> {request.admin_comment}
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