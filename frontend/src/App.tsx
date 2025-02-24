import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/common/LandingPage";
import SignIn from "./pages/common/SignIn";
import SignUp from "./pages/common/SignUp";
import ForgotPassword from "./pages/common/ForgotPassword";
import Dashboard from "./pages/common/Dashboard";
import ResetPassword from "./pages/common/ResetPassword";
import VerifyEmail from "./pages/common/VerifyEmail";

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
      </Routes>
    </Router>
  );
};

export default App;

