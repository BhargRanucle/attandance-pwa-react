
import { useLocation, Link } from "react-router-dom";
import { Home, Clock, AlertTriangle, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="sticky bottom-0 z-10 flex items-center bg-white border-t shadow-md">
      <Link 
        to="/dashboard" 
        className={`nav-item ${path === "/dashboard" ? "active" : ""}`}
      >
        <div className={`relative ${path === "/dashboard" ? "p-2 bg-app-purple/10 rounded-full" : ""}`}>
          <Home size={22} strokeWidth={2} />
          {path === "/dashboard" && (
            <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-app-purple rounded-full transform -translate-x-1/2"></span>
          )}
        </div>
        <span className={path === "/dashboard" ? "text-app-purple font-medium" : ""}>Dashboard</span>
      </Link>
      
      <Link 
        to="/time-logs" 
        className={`nav-item ${path === "/time-logs" ? "active" : ""}`}
      >
        <div className={`relative ${path === "/time-logs" ? "p-2 bg-app-purple/10 rounded-full" : ""}`}>
          <Clock size={22} strokeWidth={2} />
          {path === "/time-logs" && (
            <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-app-purple rounded-full transform -translate-x-1/2"></span>
          )}
        </div>
        <span className={path === "/time-logs" ? "text-app-purple font-medium" : ""}>Time Logs</span>
      </Link>
      
      <Link 
        to="/emergency-logs" 
        className={`nav-item ${path === "/emergency-logs" ? "active" : ""}`}
      >
        <div className={`relative ${path === "/emergency-logs" ? "p-2 bg-app-purple/10 rounded-full" : ""}`}>
          <AlertTriangle size={22} strokeWidth={2} />
          {path === "/emergency-logs" && (
            <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-app-purple rounded-full transform -translate-x-1/2"></span>
          )}
        </div>
        <span className={path === "/emergency-logs" ? "text-app-purple font-medium" : ""}>Emergency</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`nav-item ${path === "/profile" ? "active" : ""}`}
      >
        <div className={`relative ${path === "/profile" ? "p-2 bg-app-purple/10 rounded-full" : ""}`}>
          <User size={22} strokeWidth={2} />
          {path === "/profile" && (
            <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-app-purple rounded-full transform -translate-x-1/2"></span>
          )}
        </div>
        <span className={path === "/profile" ? "text-app-purple font-medium" : ""}>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
