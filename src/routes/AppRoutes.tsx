
import { Routes, Route } from "react-router-dom";

// Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import TimeLogs from "../pages/TimeLogs";
import EmergencyLogs from "../pages/EmergencyLogs";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/time-logs" element={<TimeLogs />} />
      <Route path="/emergency-logs" element={<EmergencyLogs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
