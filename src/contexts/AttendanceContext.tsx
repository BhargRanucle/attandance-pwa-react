
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

// Define types for our context
interface TimeLog {
  id: string;
  userId: string;
  checkInTime: string;
  checkOutTime: string | null;
  totalBreakTime: number; // in seconds
  date: string;
  status: "active" | "completed";
}

interface EmergencyLog {
  id: string;
  userId: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface Break {
  id: string;
  startTime: string;
  endTime: string | null;
}

interface AttendanceContextType {
  currentLog: TimeLog | null;
  todayLogs: TimeLog[];
  allLogs: TimeLog[];
  emergencyLogs: EmergencyLog[];
  isCheckedIn: boolean;
  isOnBreak: boolean;
  currentBreak: Break | null;
  activeBreaks: Break[];
  elapsedTime: number;
  breakTime: number;
  checkIn: () => void;
  checkOut: () => void;
  startBreak: () => void;
  endBreak: () => void;
  submitEmergencyLog: (date: string, reason: string, image?: string) => void;
  getWeeklySummary: () => {
    totalHours: number;
    presentDays: number;
    averageHours: number;
    totalBreakTime: number;
  };
  getFilteredLogs: (startDate: string, endDate: string) => TimeLog[];
  getFilteredEmergencyLogs: (startDate: string, endDate: string) => EmergencyLog[];
}

const AttendanceContext = createContext<AttendanceContextType>({
  currentLog: null,
  todayLogs: [],
  allLogs: [],
  emergencyLogs: [],
  isCheckedIn: false,
  isOnBreak: false,
  currentBreak: null,
  activeBreaks: [],
  elapsedTime: 0,
  breakTime: 0,
  checkIn: () => {},
  checkOut: () => {},
  startBreak: () => {},
  endBreak: () => {},
  submitEmergencyLog: () => {},
  getWeeklySummary: () => ({ totalHours: 0, presentDays: 0, averageHours: 0, totalBreakTime: 0 }),
  getFilteredLogs: () => [],
  getFilteredEmergencyLogs: () => [],
});

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentLog, setCurrentLog] = useState<TimeLog | null>(null);
  const [allLogs, setAllLogs] = useState<TimeLog[]>([]);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([]);
  const [currentBreak, setCurrentBreak] = useState<Break | null>(null);
  const [activeBreaks, setActiveBreaks] = useState<Break[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);

  // Timer for continuous updating of elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentLog && !currentBreak) {
      timer = setInterval(() => {
        const checkInTime = new Date(currentLog.checkInTime).getTime();
        const now = Date.now();
        const totalBreakTimeMs = currentLog.totalBreakTime * 1000;
        setElapsedTime(Math.floor((now - checkInTime - totalBreakTimeMs) / 1000));
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentLog, currentBreak]);

  // Timer for break time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentBreak) {
      timer = setInterval(() => {
        const startTime = new Date(currentBreak.startTime).getTime();
        const now = Date.now();
        setBreakTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      setBreakTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentBreak]);

  // Load logs from localStorage on initial load
  useEffect(() => {
    if (user) {
      const storedLogs = localStorage.getItem(`logs-${user.id}`);
      if (storedLogs) {
        const parsedLogs: TimeLog[] = JSON.parse(storedLogs);
        setAllLogs(parsedLogs);
        
        // Check if there's an active log for today
        const today = new Date().toISOString().split('T')[0];
        const activeLog = parsedLogs.find(
          log => log.date === today && log.status === "active"
        );
        
        if (activeLog) {
          setCurrentLog(activeLog);
          
          // Calculate elapsed time
          const checkInTime = new Date(activeLog.checkInTime).getTime();
          const now = Date.now();
          const totalBreakTimeMs = activeLog.totalBreakTime * 1000;
          setElapsedTime(Math.floor((now - checkInTime - totalBreakTimeMs) / 1000));
          
          // Check if there's an active break
          const storedBreaks = localStorage.getItem(`breaks-${activeLog.id}`);
          if (storedBreaks) {
            const parsedBreaks: Break[] = JSON.parse(storedBreaks);
            const activeBreak = parsedBreaks.find(brk => brk.endTime === null);
            
            if (activeBreak) {
              setCurrentBreak(activeBreak);
              setActiveBreaks(parsedBreaks);
              
              // Calculate break time
              const startTime = new Date(activeBreak.startTime).getTime();
              setBreakTime(Math.floor((now - startTime) / 1000));
            }
          }
        }
      }
      
      // Load emergency logs
      const storedEmergencyLogs = localStorage.getItem(`emergency-logs-${user.id}`);
      if (storedEmergencyLogs) {
        setEmergencyLogs(JSON.parse(storedEmergencyLogs));
      } else {
        // Generate sample emergency logs
        const sampleEmergencyLogs: EmergencyLog[] = [
          {
            id: "e1",
            userId: user.id,
            date: "2023-05-15",
            reason: "Medical appointment",
            status: "approved",
          },
          {
            id: "e2",
            userId: user.id,
            date: "2023-05-10",
            reason: "Family emergency",
            status: "approved",
          }
        ];
        
        setEmergencyLogs(sampleEmergencyLogs);
        localStorage.setItem(`emergency-logs-${user.id}`, JSON.stringify(sampleEmergencyLogs));
      }
      
      // If no logs exist yet, generate sample logs
      if (!storedLogs) {
        // Create sample logs for the past few days
        const now = new Date();
        const sampleLogs: TimeLog[] = [];
        
        // Create logs for the past 3 days
        for (let i = 3; i > 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const checkInHour = 9;
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5 PM to 7 PM
          
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, 0, 0, 0);
          
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, Math.floor(Math.random() * 59), 0, 0);
          
          // Break time 30-60 minutes
          const breakTimeSeconds = (30 + Math.floor(Math.random() * 30)) * 60;
          
          sampleLogs.push({
            id: `sample-${i}`,
            userId: user.id,
            checkInTime: checkInTime.toISOString(),
            checkOutTime: checkOutTime.toISOString(),
            totalBreakTime: breakTimeSeconds,
            date: dateString,
            status: "completed",
          });
        }
        
        setAllLogs(sampleLogs);
        localStorage.setItem(`logs-${user.id}`, JSON.stringify(sampleLogs));
      }
    }
  }, [user]);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (user && allLogs.length > 0) {
      localStorage.setItem(`logs-${user.id}`, JSON.stringify(allLogs));
    }
  }, [allLogs, user]);

  // Save emergency logs to localStorage whenever they change
  useEffect(() => {
    if (user && emergencyLogs.length > 0) {
      localStorage.setItem(`emergency-logs-${user.id}`, JSON.stringify(emergencyLogs));
    }
  }, [emergencyLogs, user]);

  // Filter logs for today
  const todayLogs = allLogs.filter(
    log => log.date === new Date().toISOString().split('T')[0]
  );

  const isCheckedIn = !!currentLog;
  const isOnBreak = !!currentBreak;

  // Check in function
  const checkIn = () => {
    if (!user) return;
    
    if (isCheckedIn) {
      toast({
        title: "Already Checked In",
        description: "You are already checked in for today.",
      });
      return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const newLog: TimeLog = {
      id: Math.random().toString(36).substring(2, 9),
      userId: user.id,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      totalBreakTime: 0,
      date: today,
      status: "active",
    };
    
    setCurrentLog(newLog);
    setAllLogs(prev => [...prev, newLog]);
    setElapsedTime(0);
    
    toast({
      title: "Checked In",
      description: `Check-in time: ${now.toLocaleTimeString()}`,
    });
  };

  // Check out function
  const checkOut = () => {
    if (!currentLog || !user) return;
    
    // Can't check out if on break
    if (isOnBreak) {
      toast({
        title: "End Break First",
        description: "Please end your break before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    
    const updatedLog: TimeLog = {
      ...currentLog,
      checkOutTime: now.toISOString(),
      status: "completed",
    };
    
    setAllLogs(prev =>
      prev.map(log => (log.id === currentLog.id ? updatedLog : log))
    );
    
    setCurrentLog(null);
    setElapsedTime(0);
    
    toast({
      title: "Checked Out",
      description: `Check-out time: ${now.toLocaleTimeString()}`,
    });
  };

  // Start break function
  const startBreak = () => {
    if (!currentLog || !user) return;
    
    if (isOnBreak) {
      toast({
        title: "Already on Break",
        description: "You are already on a break.",
      });
      return;
    }
    
    const now = new Date();
    
    const newBreak: Break = {
      id: Math.random().toString(36).substring(2, 9),
      startTime: now.toISOString(),
      endTime: null,
    };
    
    const updatedBreaks = [...activeBreaks, newBreak];
    
    setCurrentBreak(newBreak);
    setActiveBreaks(updatedBreaks);
    setBreakTime(0);
    
    localStorage.setItem(`breaks-${currentLog.id}`, JSON.stringify(updatedBreaks));
    
    toast({
      title: "Break Started",
      description: `Break started at: ${now.toLocaleTimeString()}`,
    });
  };

  // End break function
  const endBreak = () => {
    if (!currentLog || !currentBreak || !user) return;
    
    const now = new Date();
    const startTime = new Date(currentBreak.startTime).getTime();
    const breakDuration = Math.floor((now.getTime() - startTime) / 1000); // in seconds
    
    // Update the break
    const updatedBreak: Break = {
      ...currentBreak,
      endTime: now.toISOString(),
    };
    
    // Update the breaks array
    const updatedBreaks = activeBreaks.map(b =>
      b.id === currentBreak.id ? updatedBreak : b
    );
    
    // Update the current log with the break time
    const updatedLog: TimeLog = {
      ...currentLog,
      totalBreakTime: currentLog.totalBreakTime + breakDuration,
    };
    
    setCurrentLog(updatedLog);
    setAllLogs(prev =>
      prev.map(log => (log.id === currentLog.id ? updatedLog : log))
    );
    
    setCurrentBreak(null);
    setActiveBreaks(updatedBreaks);
    setBreakTime(0);
    
    localStorage.setItem(`breaks-${currentLog.id}`, JSON.stringify(updatedBreaks));
    
    toast({
      title: "Break Ended",
      description: `Break duration: ${formatTime(breakDuration)}`,
    });
  };

  // Submit emergency log function
  const submitEmergencyLog = (date: string, reason: string, image?: string) => {
    if (!user) return;
    
    const newLog: EmergencyLog = {
      id: Math.random().toString(36).substring(2, 9),
      userId: user.id,
      date,
      reason,
      status: "pending",
      // ...(image ? { image } : {})
    };
    
    setEmergencyLogs(prev => [...prev, newLog]);
    
    toast({
      title: "Emergency Log Submitted",
      description: "Your emergency log has been submitted for approval.",
    });
  };

  // Get weekly summary
  const getWeeklySummary = () => {
    if (!user) {
      return {
        totalHours: 0,
        presentDays: 0,
        averageHours: 0,
        totalBreakTime: 0,
      };
    }
    
    // Get logs from the past 7 days
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const weekLogs = allLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= oneWeekAgo && logDate <= now;
    });
    
    // Calculate statistics
    let totalTimeSeconds = 0;
    let totalBreakSeconds = 0;
    const presentDays = new Set(weekLogs.map(log => log.date)).size;
    
    weekLogs.forEach(log => {
      if (log.status === "completed" && log.checkOutTime) {
        const checkInTime = new Date(log.checkInTime).getTime();
        const checkOutTime = new Date(log.checkOutTime).getTime();
        const duration = (checkOutTime - checkInTime) / 1000;
        totalTimeSeconds += duration - log.totalBreakTime;
        totalBreakSeconds += log.totalBreakTime;
      }
    });
    
    const totalHours = totalTimeSeconds / 3600;
    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;
    
    return {
      totalHours,
      presentDays,
      averageHours,
      totalBreakTime: totalBreakSeconds / 3600,
    };
  };

  // Filter logs by date range
  const getFilteredLogs = (startDate: string, endDate: string) => {
    return allLogs.filter(log => log.date >= startDate && log.date <= endDate);
  };

  // Filter emergency logs by date range
  const getFilteredEmergencyLogs = (startDate: string, endDate: string) => {
    return emergencyLogs.filter(log => log.date >= startDate && log.date <= endDate);
  };

  // Helper function to format time in HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentLog,
        todayLogs,
        allLogs,
        emergencyLogs,
        isCheckedIn,
        isOnBreak,
        currentBreak,
        activeBreaks,
        elapsedTime,
        breakTime,
        checkIn,
        checkOut,
        startBreak,
        endBreak,
        submitEmergencyLog,
        getWeeklySummary,
        getFilteredLogs,
        getFilteredEmergencyLogs,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
