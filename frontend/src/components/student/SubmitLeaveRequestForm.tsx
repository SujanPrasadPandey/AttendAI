import React, { useState } from "react";
import apiClient from "../../utils/api"; // Make sure this path is correct for your project structure

const SubmitLeaveRequestForm: React.FC = () => {
  // State hooks for form inputs and feedback messages
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);     // Clear previous errors
    setSuccess(null);   // Clear previous success messages
    setIsSubmitting(true); // Indicate loading state

    // Basic validation: Check if end date is before start date
     if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      setIsSubmitting(false);
      return; // Stop submission
    }


    try {
      // Make API call to create leave request
      await apiClient.post("/api/leave_requests/create/", { // Ensure endpoint is correct
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      // On success
      setSuccess("Leave request submitted successfully!");
      // Reset form fields
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err: any) { // Catch potential errors (consider more specific error typing)
      console.error("Leave request submission failed:", err);
      // Set error message (try to get specific message from response if available)
      setError(err.response?.data?.detail || "Failed to submit leave request. Please check details and try again.");
    } finally {
      setIsSubmitting(false); // Re-enable form/button regardless of success/error
    }
  };

  // Common input styles for consistency
  const inputStyles = `
    w-full p-2 border rounded
    bg-white text-gray-900 placeholder-gray-500
    border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none
    dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
    dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500
  `;

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4"> {/* Added space-y-4 for spacing between form elements */}
      {/* Form heading */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Submit Leave Request
      </h2>

      {/* Start Date Input Field */}
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Start Date
        </label>
        <input
          type="date"
          id="start_date" // ID for label association
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputStyles}
          required
          disabled={isSubmitting} // Disable during submission
        />
      </div>

      {/* End Date Input Field */}
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          End Date
        </label>
        <input
          type="date"
          id="end_date" // ID for label association
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputStyles}
          required
          disabled={isSubmitting} // Disable during submission
        />
      </div>

      {/* Reason Text Area */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Reason
        </label>
        <textarea
          id="reason" // ID for label association
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`${inputStyles} min-h-[100px]`} // Apply shared styles + min height
          required
          disabled={isSubmitting} // Disable during submission
        />
      </div>

      {/* Submit Button */}
      <div> {/* Wrapped button for layout consistency if needed */}
        <button
          type="submit"
          // Button styling: background, text, padding, rounding, hover, focus, disabled states
          className={`
            w-full sm:w-auto px-4 py-2 rounded text-white font-medium
            bg-blue-600 hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          disabled={isSubmitting} // Disable button when submitting
        >
          {isSubmitting ? "Submitting..." : "Submit Request"} {/* Show loading text */}
        </button>
      </div>

      {/* Feedback Messages */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">{success}</p>
      )}
    </form>
  );
};

export default SubmitLeaveRequestForm;