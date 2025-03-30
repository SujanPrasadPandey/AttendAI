import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/common/LandingPage';
import SignIn from './pages/common/SignIn';
import SignUp from './pages/common/SignUp';
import ForgotPassword from './pages/common/ForgotPassword';
import Dashboard from './pages/common/Dashboard';
import ResetPassword from './pages/common/ResetPassword';
import VerifyEmail from './pages/common/VerifyEmail';
import ProfileSettings from './pages/common/ProfileSettings';
import ManageUsers from './pages/admin/ManageUsers';
import AddUser from './pages/admin/AddUser';
import EditUser from './pages/admin/EditUser';
import BulkAddUsers from './pages/admin/BulkAddUsers';
import BulkRemoveUsers from './pages/admin/BulkRemoveUsers';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

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
            <ProtectedRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        {/* Admin-Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="manage/:role" element={<ManageUsers />} />
          <Route path="add/:role" element={<AddUser />} />
          <Route path="edit/:role/:userId" element={<EditUser />} />
          <Route path="bulk-add" element={<BulkAddUsers />} />
          <Route path="bulk-remove" element={<BulkRemoveUsers />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
        </Route>

        {/* Add more role-specific routes here as needed */}
      </Routes>
    </Router>
  );
};

export default App;