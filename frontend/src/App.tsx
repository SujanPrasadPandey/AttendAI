import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import LandingPage from './pages/common/LandingPage';
import SignIn from './pages/common/SignIn';
import SignUp from './pages/common/SignUp';
import ForgotPassword from './pages/common/ForgotPassword';
import Dashboard from './pages/common/Dashboard';
import ResetPassword from './pages/common/ResetPassword';
import VerifyEmail from './pages/common/VerifyEmail';
import ProfileSettings from './pages/common/ProfileSettings';
import ManageUsers from './pages/common/ManageUsers';
import AddUser from './pages/common/AddUser';
import EditUser from './pages/common/EditUser';

const RoleBasedManagePage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  return <ManageUsers role={role || 'teacher'} />;
};

const RoleBasedAddPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  return <AddUser />;
};

const RoleBasedEditPage: React.FC = () => {
  const { role, userId } = useParams<{ role: string; userId: string }>();
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
        <Route path="/manage/:role" element={<RoleBasedManagePage />} />
        <Route path="/manage/:role/add" element={<RoleBasedAddPage />} />
        <Route path="/manage/:role/edit/:userId" element={<RoleBasedEditPage />} />
      </Routes>
    </Router>
  );
};

export default App;
