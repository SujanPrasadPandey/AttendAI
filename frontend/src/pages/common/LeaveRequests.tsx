import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import SubmitLeaveRequestForm from "../../components/student/SubmitLeaveRequestForm";
import StudentLeaveRequestsList from "../../components/student/StudentLeaveRequestsList";
import AdminLeaveRequestsList from "../../components/admin/AdminLeaveRequestsList";

interface LeaveRequest {
  id: number;
  student: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  admin_comment: string | null;
}

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await apiClient.get("/api/leave_requests/list/");
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch leave requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>
      {user?.role === "student" && <SubmitLeaveRequestForm />}
      {user?.role === "admin" ? (
        <AdminLeaveRequestsList requests={requests} />
      ) : (
        <StudentLeaveRequestsList requests={requests} />
      )}
    </div>
  );
};

export default LeaveRequests;