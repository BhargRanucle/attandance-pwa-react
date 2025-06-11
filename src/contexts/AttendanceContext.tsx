import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

/* ---------- interfaces ---------- */
interface TimeLog {
  id: string;
  userId: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  breakTime: number;
  date: string;
  status: "active" | "completed";
}
type PunchType = "check-in" | "check-out" | null;

interface AttendanceContextType {
  currentLog: TimeLog | null;
  todayLogs: TimeLog[];
  allLogs: TimeLog[];
  isCheckedIn: boolean;
  elapsedTime: number;
  totalBreakTimeToday: number;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  getWeeklySummary: () => {
    totalHours: number;
    presentDays: number;
    averageHours: number;
    totalBreakTime: number;
  };
  getFilteredLogs: (s: string, e: string) => TimeLog[];
  earliestCheckInTime: Date | null;
  lastPunchType: PunchType;
  isLoading: boolean;
  fetchRangeLogs: (start: string, end: string) => Promise<void>;
  dateFilteredTimeLogs: any[];
  setDateFilteredTimeLogs: React.Dispatch<React.SetStateAction<any[]>>;
  rangeStart: string;
  rangeEnd: string;
  setRange: (s: string, e: string) => void;
  locationBlocked: boolean;
  requestLocationPermission: () => Promise<void>;
}

/* ---------- context ---------- */
const AttendanceContext = createContext<AttendanceContextType>({
  currentLog: null,
  todayLogs: [],
  allLogs: [],
  isCheckedIn: false,
  elapsedTime: 0,
  totalBreakTimeToday: 0,
  checkIn: async () => { },
  checkOut: async () => { },
  getWeeklySummary: () => ({
    totalHours: 0,
    presentDays: 0,
    averageHours: 0,
    totalBreakTime: 0,
  }),
  getFilteredLogs: () => [],
  earliestCheckInTime: null,
  lastPunchType: null,
  isLoading: false,
  fetchRangeLogs: async () => { },
  dateFilteredTimeLogs: [],
  setDateFilteredTimeLogs: () => { },
  rangeStart: "",
  rangeEnd: "",
  setRange: () => { },
} as any);

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("staffuser_token");
  const [currentLog, setCurrentLog] = useState<TimeLog | null>(null);
  const [allLogs, setAllLogs] = useState<TimeLog[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalBreakTimeToday, setTotalBreakTimeToday] = useState(0);
  const [lastPunchType, setLastPunchType] = useState<PunchType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilteredTimeLogs, setDateFilteredTimeLogs] = useState<any[]>([]);
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const [locationBlocked, setLocationBlocked] = useState(false);

  const checkLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation || !navigator.permissions) return false;
    try {
      const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (status.state === "granted") return true;
      if (status.state === "prompt") {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 10000 }
          );
        });
      }
      return false;
    } catch (e) {
      console.error("Error checking location permission", e);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) return;
    try {
      await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      setLocationBlocked(false);
    } catch (err) {
      setLocationBlocked(true);
    }
  };

  // ---- location-tracking helpers ----
  const locationTimerRef = useRef<NodeJS.Timeout | null>(null);

  /** Hit /staff-locations with current browser coordinates */
  const sendLocationPing = async () => {
    if (!user) return;
    const lastPing = localStorage.getItem('lastLocationPing');
    const now = Date.now();
    if (lastPing && now - parseInt(lastPing) < 300_000) {
      return;
    }
    const getCoords = (): Promise<GeolocationPosition> =>
      new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
          timeout: 10_000,
        })
      );
    try {
      const pos = await getCoords();
      const { latitude, longitude } = pos.coords;
      await axios.post(
        `${API_URL}add-staff-location`,
        {
          uuid: user.uuid,
          name: user.name || "",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('lastLocationPing', now.toString());
    } catch (err) {
      console.error("Location ping failed →", err);
    }
  };

  /** Start an interval that pings every 5 min until stopped */
  const startLocationTracking = () => {
    if (locationTimerRef.current) {
      clearInterval(locationTimerRef.current);
    }
    locationTimerRef.current = setInterval(() => {
      if (localStorage.getItem('isTrackingLocation') === 'true') {
        sendLocationPing();
      } else {
        stopLocationTracking();
      }
    }, 300_000);
  };

  /** Clear the interval if one exists */
  const stopLocationTracking = () => {
    if (locationTimerRef.current) {
      clearInterval(locationTimerRef.current);
      locationTimerRef.current = null;
    }
  };

  const setRange = (s: string, e: string) => {
    setRangeStart(s);
    setRangeEnd(e);
  };

  const toLocalIso = (raw: string | undefined) =>
    raw ? raw.replace(" ", "T") : null;

  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allLogs.filter((l) => l.date === today);
  }, [allLogs]);

  const earliestCheckInTime = useMemo(() => {
    const realTimes = todayLogs
      .filter((l) => l.checkInTime)
      .map((l) => new Date(l.checkInTime!).getTime());
    if (!realTimes.length) return null;
    return new Date(Math.min(...realTimes));
  }, [todayLogs]);

  useEffect(() => {
    const todayBreak = todayLogs.reduce((t, l) => t + l.breakTime, 0);
    setTotalBreakTimeToday(todayBreak);
  }, [todayLogs]);

  const fetchTimeLogs = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}timelogs/${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const logs: TimeLog[] = (data?.data || []).map((row: any) => {
        let totalWorkSecs = 0;
        let totalBreakSecs = 0;
        let lastCheckOut: Date | null = null;
        let currentCheckIn: Date | null = null;
        row.punches?.forEach((p: any) => {
          const punchTime = new Date(toLocalIso(p.timestamp)!);
          if (p.type === "check-in") {
            if (lastCheckOut) {
              totalBreakSecs += (punchTime.getTime() - lastCheckOut.getTime()) / 1000;
              lastCheckOut = null;
            }
            currentCheckIn = punchTime;
          }
          if (p.type === "check-out" && currentCheckIn) {
            totalWorkSecs += (punchTime.getTime() - currentCheckIn.getTime()) / 1000;
            currentCheckIn = null;
            lastCheckOut = punchTime;
          }
        });
        return {
          id: `log-${row.date}`,
          userId: user.id,
          checkInTime: toLocalIso(row.punches?.[0]?.timestamp),
          checkOutTime: toLocalIso(row.punches?.at(-1)?.timestamp),
          breakTime: totalBreakSecs,
          date: row.date,
          status: currentCheckIn ? "active" : "completed",
        };
      });
      setAllLogs(logs);
      const today = new Date().toISOString().split("T")[0];
      const todayRow = data?.data?.find((r: any) => r.date === today);
      if (todayRow) {
        const lastPunch = todayRow.punches.at(-1);
        setLastPunchType(lastPunch?.type ?? null);
        if (lastPunch?.type === "check-in") {
          setCurrentLog({
            id: `log-${todayRow.punches.length}`,
            userId: user.id,
            checkInTime: toLocalIso(lastPunch.timestamp),
            checkOutTime: null,
            breakTime: totalBreakTimeToday,
            date: today,
            status: "active",
          });
        } else {
          setCurrentLog(null);
        }
      } else {
        setCurrentLog(null);
        setLastPunchType(null);
      }
    } catch (err) {
      console.error("Error fetching timelogs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTimeLogs().then(() => {
        if (lastPunchType === "check-in" && localStorage.getItem('isTrackingLocation') === 'true') {
          startLocationTracking();
        }
      });
    }
    return () => {
      stopLocationTracking();
    };
  }, [user]);
  useEffect(() => {
    const tick = () => {
      const closedSecs = todayLogs.reduce((sum, log) => {
        if (log.checkInTime && log.checkOutTime) {
          const inT = new Date(log.checkInTime).getTime();
          const outT = new Date(log.checkOutTime).getTime();
          return sum + (outT - inT) / 1000 - log.breakTime;
        }
        return sum;
      }, 0);
      let openSecs = 0;
      if (currentLog && lastPunchType === "check-in" && currentLog.checkInTime) {
        openSecs =
          (Date.now() - new Date(currentLog.checkInTime).getTime()) / 1000;
      }
      setElapsedTime(Math.floor(closedSecs + openSecs - 19800));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [todayLogs, currentLog, lastPunchType]);

  const checkIn = async () => {
    if (!user) return;
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setLocationBlocked(true);
      return;
    }
    setLocationBlocked(false);
    const now = new Date().toISOString();
    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      checkInTime: now,
      checkOutTime: null,
      breakTime: 0,
      date: new Date().toISOString().split("T")[0],
      status: "active",
    };
    try {
      await axios.post(
        `${API_URL}add-timelogs`,
        { user_id: user.id, type: "check-in", break_time: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('isTrackingLocation', 'true');
      localStorage.setItem('lastLocationPing', Date.now().toString());
      setAllLogs((prev) => [...prev, newLog]);
      setCurrentLog(newLog);
      setLastPunchType("check-in");
      await fetchTimeLogs();
      await sendLocationPing();
      startLocationTracking();
      const todayIso = new Date().toISOString().split("T")[0];
      const start = rangeStart || todayIso;
      const end = rangeEnd || todayIso;
      await fetchRangeLogs(start, end);
    } catch (err) {
      console.error("Check-in failed", err);
    }
  };

  const checkOut = async () => {
    if (!user || lastPunchType !== "check-in" || !currentLog) return;
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setLocationBlocked(true);
      return;
    }
    setLocationBlocked(false);
    const now = new Date().toISOString();
    try {
      await axios.post(
        `${API_URL}add-timelogs`,
        { user_id: user.id, type: "check-out" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedLog: TimeLog = {
        ...currentLog,
        checkOutTime: now,
        status: "completed",
      };
      setAllLogs((prev) =>
        prev.map((l) => (l.id === currentLog.id ? updatedLog : l))
      );
      setCurrentLog(null);
      setLastPunchType("check-out");
      await fetchTimeLogs();
      stopLocationTracking();
      const todayIso = new Date().toISOString().split("T")[0];
      const start = rangeStart || todayIso;
      const end = rangeEnd || todayIso;
      await fetchRangeLogs(start, end);
    } catch (err) {
      console.error("Check-out failed", err);
    }
  };

  const fetchRangeLogs = async (start: string, end: string) => {
    if (!user) return;
    setIsLoading(true);
    setRange(start, end);
    try {
      const { data } = await axios.post(
        `${API_URL}staff-timelog-range`,
        {
          user_id: user.id,
          start_date: start,
          end_date: end,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rawLogs = data.data ?? [];
      const transformedLogs = rawLogs.map((log: any) => {
        const date = new Date(log.date);
        const parseTime = (timeStr: string | null) => {
          if (!timeStr) return null;
          return new Date(`${log.date}T${timeStr}`);
        };
        const hmsToSeconds = (hms: string) => {
          const [h, m, s] = hms.split(":").map(Number);
          return h * 3600 + m * 60 + s;
        };
        return {
          id: log.date,
          date,
          checkInTime: parseTime(log.check_in),
          checkOutTime: parseTime(log.check_out),
          breakTime: hmsToSeconds(log.break_hours ?? "00:00:00"),
          totalWorkSeconds: hmsToSeconds(log.total_hours ?? "00:00:00"),
          punches: log.punches,
        };
      });
      setDateFilteredTimeLogs(transformedLogs);
    } catch (err) {
      console.error("Error fetching range logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeeklySummary = () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const logs = allLogs.filter(
      (l) => new Date(l.date) >= weekAgo && new Date(l.date) <= now
    );
    const presentDays = new Set(logs.map((l) => l.date)).size;
    const totalSec = logs.reduce((s, l) => {
      if (l.status === "completed" && l.checkOutTime)
        s +=
          (new Date(l.checkOutTime).getTime() -
            new Date(l.checkInTime!).getTime()) /
          1000 -
          l.breakTime;
      return s;
    }, 0);
    return {
      totalHours: totalSec / 3600,
      presentDays,
      averageHours: presentDays ? totalSec / 3600 / presentDays : 0,
      totalBreakTime: logs.reduce((t, l) => t + l.breakTime, 0) / 3600,
    };
  };

  const getFilteredLogs = (s: string, e: string) =>
    allLogs.filter((l) => l.date >= s && l.date <= e);
  const isCheckedIn = lastPunchType === "check-in";
  useEffect(() => {
    if (lastPunchType === "check-in") startLocationTracking();
    else stopLocationTracking();
  }, [lastPunchType]);

  /* ---------- cleanup on unmount ---------- */
  useEffect(() => stopLocationTracking, []);
  return (
    <AttendanceContext.Provider
      value={{
        currentLog,
        todayLogs,
        allLogs,
        isCheckedIn,
        elapsedTime,
        totalBreakTimeToday,
        checkIn,
        checkOut,
        getWeeklySummary,
        getFilteredLogs,
        earliestCheckInTime,
        lastPunchType,
        isLoading,
        fetchRangeLogs,
        dateFilteredTimeLogs,
        setDateFilteredTimeLogs,
        rangeStart,
        rangeEnd,
        setRange,
        locationBlocked,
        requestLocationPermission,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};