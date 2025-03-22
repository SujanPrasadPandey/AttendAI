import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
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

const RoleBasedManagePage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  return <ManageUsers role={role || 'teacher'} />;
};

const RoleBasedAddPage: React.FC = () => {
  return <AddUser />;
};

const RoleBasedEditPage: React.FC = () => {
  return <EditUser />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password-confirm" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile" element={<ProfileSettings />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="manage/:role" element={<RoleBasedManagePage />} />
          <Route path="add/:role" element={<RoleBasedAddPage />} />
          <Route path="edit/:role/:userId" element={<RoleBasedEditPage />} />
          <Route path="bulk-add" element={<BulkAddUsers />} />
          <Route path="bulk-remove" element={<BulkRemoveUsers />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;