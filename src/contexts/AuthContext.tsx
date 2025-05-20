
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Define types for our context
interface User {
  id: string;
  username: string;
  phone: string;
  email?: string;
  department?: string;
  address?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, phone: string) => Promise<boolean>;
  register: (username: string, phone: string) => Promise<boolean>;
  logout: () => void;
  verifyOtp: (otp: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => void;
  pendingPhone: string | null;
  pendingUsername: string | null;
  setPendingPhone: (phone: string | null) => void;
  setPendingUsername: (username: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  verifyOtp: async () => false,
  updateProfile: () => {},
  pendingPhone: null,
  pendingUsername: null,
  setPendingPhone: () => {},
  setPendingUsername: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for existing user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function
  const login = async (username: string, phone: string): Promise<boolean> => {
    try {
      // In a real app, you would call an API here
      setPendingPhone(phone);
      setPendingUsername(username);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your mobile number",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Mock register function
  const register = async (username: string, phone: string): Promise<boolean> => {
    try {
      // In a real app, you would call an API here
      setPendingPhone(phone);
      setPendingUsername(username);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your mobile number to complete registration",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Mock OTP verification
  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (!pendingPhone || !pendingUsername) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // In a real app, you would verify the OTP with an API
      // For demo purposes, any 4-digit OTP works
      if (otp.length !== 4) {
        toast({
          title: "Invalid OTP",
          description: "Please enter a valid 4-digit OTP",
          variant: "destructive",
        });
        return false;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new user object
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        username: pendingUsername,
        phone: pendingPhone,
        email: "",
        department: "",
        address: "",
      };

      // Save the user to localStorage
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setPendingPhone(null);
      setPendingUsername(null);
      
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  // Update profile function
  const updateProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  // Calculate authentication status based on user
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        verifyOtp,
        updateProfile,
        pendingPhone,
        pendingUsername,
        setPendingPhone,
        setPendingUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
