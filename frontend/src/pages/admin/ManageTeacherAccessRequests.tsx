import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api"; // Adjust the import path based on your project structure

interface AccessRequest {
  id: number;
  teacher: number;
  teacher_username: string;
  school_class: number;
  school_class_name: string;
  status: string;
  requested_at: string;
  approved_at?: string | null;
  expiry_at?: string | null;
  note?: string | null;
}

const ManageTeacherAccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/api/teacher_access/list/");
        setRequests(response.data);
      } catch (err) {
        console.error("Error fetching access requests:", err);
        setError("Failed to load access requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (
    requestId: number,
    action: "approve" | "deny" | "pending"
  ) => {
    setError(null);
    try {
      const data: { action: string; duration_days?: number } = { action };
      if (action === "approve") {
        data.duration_days = 1; // Default to 1 day
      }
      const response = await apiClient.put(
        `/api/teacher_access/update/${requestId}/`,
        data
      );
      setRequests(
        requests.map((req) => (req.id === requestId ? response.data : req))
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || `Error performing action: ${action}.`
      );
    }
  };

  const filteredRequests = showOnlyPending
    ? requests.filter((req) => req.status === "pending")
    : requests;

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-2xl font-bold mb-6">
        Manage Teacher Access Requests
      </h2>
      <div className="mb-4">
        <button
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-gray-100"
        >
          {showOnlyPending ? "Show All Requests" : "Show Only Pending"}
        </button>
      </div>
      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {filteredRequests.length > 0 ? (
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">
                Teacher
              </th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">
                Requested Class
              </th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">
                Request Date
              </th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">Expiry Date</th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">
                Status
              </th>
              <th className="border border-gray-700 px-4 py-2 text-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-gray-100">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-800">
                <td className="border border-gray-700 px-4 py-2">
                  {request.teacher_username}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  {request.school_class_name}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  {new Date(request.requested_at).toLocaleDateString()}{" "}
                  {new Date(request.requested_at).toLocaleTimeString()}
                </td>
                <td className="border border-gray-700 px-4 py-2">
  {request.expiry_at ? new Date(request.expiry_at).toLocaleString() : '-'}
</td>
                <td className="border border-gray-700 px-4 py-2">
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </td>
                <td className="border border-gray-700 px-4 py-2">
                  {request.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAction(request.id, "approve")}
                        className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.id, "deny")}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                      >
                        Deny
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(request.id, "pending")}
                        className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-sm mr-2"
                      >
                        Reset to Pending
                      </button>
                      {request.status === "approved" && (
                        <button
                          onClick={() => handleAction(request.id, "deny")}
                          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                        >
                          Deny
                        </button>
                      )}
                      {request.status === "denied" && (
                        <button
                          onClick={() => handleAction(request.id, "approve")}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-300">
          {showOnlyPending
            ? "No pending access requests."
            : "No access requests found."}
        </p>
      )}
    </div>
  );
};

export default ManageTeacherAccessRequests;
