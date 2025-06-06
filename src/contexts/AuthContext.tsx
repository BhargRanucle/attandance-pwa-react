/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_APP_URL;

interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  uuid?: string;
  department?: string;
  address?: string;
  profilePicture?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<boolean>;
  logout: () => void;
  verifyOtp: (otp: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => void;
  pendingPhone: string | null;
  setPendingPhone: (phone: string | null) => void;
  verifyToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => { },
  verifyOtp: async () => false,
  updateProfile: () => { },
  pendingPhone: null,
  setPendingPhone: () => { },
  verifyToken: async () => false,
  refreshToken: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("staffuser_data");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("staffuser_token") || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // We'll store the refresh timeout id here
  const refreshTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // Helper: Decode JWT to get expiry time
  function getTokenExpiry(jwtToken: string): number | null {
    try {
      const base64Payload = jwtToken.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  // Schedule token refresh some minutes before expiration
  function scheduleRefresh(tokenToSchedule: string) {
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current);
    }
    const expiryTime = getTokenExpiry(tokenToSchedule);
    if (!expiryTime) return;
    const now = Date.now();
    const msBeforeExpiry = expiryTime - now;
    const refreshTime = msBeforeExpiry > 60_000 ? msBeforeExpiry - 60_000 : 0;
    refreshTimeoutId.current = setTimeout(async () => {
      const success = await refreshToken();
      if (!success) {
        logout();
      }
    }, refreshTime);
  }

  useEffect(() => {
    setIsLoading(false);
    if (token) {
      scheduleRefresh(token);
    }
    return () => {
      if (refreshTimeoutId.current) clearTimeout(refreshTimeoutId.current);
    };
  }, [token]);

  const verifyToken = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await axios.post(`${API_URL}api/app/auth/verifyJWT`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.status === 200;
    } catch {
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await axios.post(`${API_URL}api/app/auth/refreshJWT`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newToken = res.data.data.token;
      setToken(newToken);
      localStorage.setItem("staffuser_token", newToken);
      scheduleRefresh(newToken);
      return true;
    } catch (err) {
      console.error("Failed to refresh token", err);
      return false;
    }
  };

  const login = async (phone: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}api/app/auth/request-otp`, { phone });
      setPendingPhone(phone);
      return true;
    } catch (error: any) {
      return false;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (!pendingPhone) {
      return false;
    }
    try {
      const res = await axios.post(`${API_URL}api/app/auth/login`, {
        phone: pendingPhone,
        otp,
      });
      const staff = res.data.data.userData;
      const receivedToken = res.data.data.token;
      setUser(staff);
      setToken(receivedToken);
      localStorage.setItem("staffuser_data", JSON.stringify(staff));
      localStorage.setItem("staffuser_token", receivedToken);
      setPendingPhone(null);
      navigate("/time-logs");
      return true;
    } catch (error: any) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}api/app/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    }
    if (refreshTimeoutId.current) {
      clearTimeout(refreshTimeoutId.current);
    }
    localStorage.removeItem("staffuser_data");
    localStorage.removeItem("staffuser_token");
    setUser(null);
    setToken(null);
    navigate("/");
  };

  const updateProfile = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    localStorage.setItem("staffuser_data", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        verifyOtp,
        updateProfile,
        pendingPhone,
        setPendingPhone,
        verifyToken,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};