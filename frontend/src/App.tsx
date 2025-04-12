// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/common/LandingPage";
import SignIn from "./pages/common/SignIn";
import SignUp from "./pages/common/SignUp";
import ForgotPassword from "./pages/common/ForgotPassword";
import Dashboard from "./pages/common/Dashboard";
import ResetPassword from "./pages/common/ResetPassword";
import VerifyEmail from "./pages/common/VerifyEmail";
import ProfileSettings from "./pages/common/ProfileSettings";
import ManageUsers from "./pages/admin/ManageUsers";
import AddUser from "./pages/admin/AddUser";
import EditUser from "./pages/admin/EditUser";
import BulkAddUsers from "./pages/admin/BulkAddUsers";
import BulkRemoveUsers from "./pages/admin/BulkRemoveUsers";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
// import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDetails from "./pages/admin/StudentDetails";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageSubjects from "./pages/admin/ManageSubjects";
import ManageTeacherAccessRequests from "./pages/admin/ManageTeacherAccessRequests";
import ManageStudentPhotos from "./pages/admin/ManageStudentPhotos";
import MarkAttendance from "./pages/teacher/MarkAttendance";
import UnrecognizedFaces from "./pages/common/UnrecognizedFaces";
import ReviewFaces from "./pages/admin/ReviewFaces";
import ManageAttendance from "./pages/teacher/ManageAttendance";
import StudentAttendanceViewer from "./pages/common/StudentAttendanceViewer";
import TeacherLayout from "./components/teacher/TeacherLayout";
import LeaveRequests from "./pages/common/LeaveRequests";
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboardWrapper from "./components/student/StudentDashboardWrapper";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-confirm" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes for All Authenticated Users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "parent", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "parent", "admin"]}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/:studentId/attendance"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "parent", "admin"]}>
              <StudentAttendanceViewer />
            </ProtectedRoute>
          }
        />

        {/* Admin-Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageAttendance />} />
          <Route path="manage/:role" element={<ManageUsers />} />
          <Route path="add/:role" element={<AddUser />} />
          <Route path="edit/:role/:userId" element={<EditUser />} />
          <Route path="bulk-add" element={<BulkAddUsers />} />
          <Route path="bulk-remove" element={<BulkRemoveUsers />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="manage-classes" element={<ManageClasses />} />
          <Route path="manage-subjects" element={<ManageSubjects />} />
          <Route path="manage-teacher-access-requests" element={<ManageTeacherAccessRequests />} />
          <Route path="manage-student-photos" element={<ManageStudentPhotos />} />
          <Route path="review-faces" element={<ReviewFaces />} />
          <Route path="unrecognized-faces" element={<UnrecognizedFaces />} />
          <Route path="manage-attendance" element={<ManageAttendance />} />
          <Route path="leave-requests" element={<LeaveRequests />} /> 
        </Route>

        {/* Teacher-Only Routes with Layout */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManageAttendance />} />
          <Route path="manage-attendance" element={<ManageAttendance />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* Student-Only Routes with Layout */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboardWrapper />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;