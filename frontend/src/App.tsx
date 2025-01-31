import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/common/LandingPage";
import SignIn from "./pages/common/SignIn";
import SignUp from "./pages/common/SignUp";
import Dashboard from "./pages/common/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;

