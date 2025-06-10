import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimeDisplay from "@/components/TimeDisplay";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Calendar, LineChart, History } from "lucide-react";
import axios from "axios";
import Loader from '../components/Loader';

interface Punch {
  type: string;
  time: string;
  timestamp: string;
}

interface Log {
  date: string;
  staff_name: string;
  check_in: string;
  check_out: string;
  punches: Punch[];
  formatted_punches: string;
  total_hours: string;
  break_hours: string;
}

interface WeeklySummary {
  totalHours: number;
  presentDays: number;
  averageHours: number;
  totalBreakTime: number;
}

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const { isAuthenticated, user } = useAuth();
  const [todayLog, setTodayLog] = useState<Log | null>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("staffuser_token");
        const todayResponse = await axios.post(`${API_URL}dashboard-today-log/${user.id}`, {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (todayResponse.data.success && todayResponse.data.data.length > 0) {
          setTodayLog(todayResponse.data.data[0]);
          const lastPunch = todayResponse.data.data[0].punches[todayResponse.data.data[0].punches.length - 1];
          setIsCheckedIn(lastPunch?.type === "check-in");
        }
        const weeklyResponse = await axios.post(`${API_URL}dashboard-weekly-log/${user.id}`, {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (weeklyResponse.data.success) {
          setWeeklyLogs(weeklyResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && todayLog) {
      const updateElapsedTime = () => {
        const lastCheckIn = todayLog.punches
          .filter(p => p.type === "check-in")
          .pop()?.timestamp;
        if (lastCheckIn) {
          const checkInTime = new Date(lastCheckIn).getTime();
          const now = new Date().getTime();
          setElapsedTime(Math.floor((now - checkInTime) / 1000));
        }
      };
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, todayLog]);

  const getWeeklySummary = (): WeeklySummary => {
    const presentDays = weeklyLogs.length;
    let totalHours = 0;
    let totalBreakTime = 0;
    weeklyLogs.forEach(log => {
      const [hours, minutes] = log.total_hours.split(':').map(Number);
      totalHours += hours + (minutes / 60);
      const [breakHours, breakMinutes] = log.break_hours.split(':').map(Number);
      totalBreakTime += breakHours + (breakMinutes / 60);
    });
    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;
    return {
      totalHours,
      presentDays,
      averageHours,
      totalBreakTime
    };
  };

  const weeklySummary = getWeeklySummary();
  const recentLogs = weeklyLogs
    .filter(log => log.date !== todayLog?.date)
    .slice(0, 3)
    .reverse();
  if (isLoading) {
    return <Loader />;
  }

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Today's Log Card */}
        <div className="">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <Clock className="text-app-purple" size={25} />
                <CardTitle className="text-lg font-bold">
                  Today's Log - {format(new Date(), "EEEE, MMM d")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {todayLog ? (
                <div className="flex flex-col items-center py-3 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isOnBreak ? "On Break" : "Working Time"}
                    </p>
                    <TimeDisplay
                      seconds={elapsedTime}
                      pulsing={isCheckedIn}
                      size="lg"
                    />
                  </div>
                  <div className="w-full grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col items-center p-5 bg-[#222222]/10 rounded-full">
                      <span className="text-lg text-muted-foreground font-normal">Check In</span>
                      <span className="heading-report text-2xl font-bold mt-1 text-black">
                        {todayLog.check_in}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-5 bg-[#222222]/10 rounded-full">
                      <span className="text-lg text-muted-foreground font-normal">Break Time</span>
                      <span className="heading-report text-2xl font-bold mt-1 text-black">
                        {todayLog.break_hours}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    You haven't checked in today.
                  </p>
                  <p className="text-sm mt-1">
                    Go to Time Logs to start tracking your time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Report Card */}
        <div className="" style={{ animationDelay: "0.1s" }}>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <LineChart className="text-app-purple" size={25} />
                <CardTitle className="text-lg font-bold">Weekly Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg">
                  <p className="text-[#222222] text-sm">Total Hours</p>
                  <p className="heading-report text-2xl font-semibold mt-1 text-app-purple">
                    {weeklySummary.totalHours.toFixed(1)}h
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg">
                  <p className="text-[#222222] text-sm">Present Days</p>
                  <p className="heading-report text-2xl font-semibold mt-1 text-app-purple">
                    {`${weeklySummary.presentDays}/6`}
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg">
                  <p className="text-[#222222] text-sm">Avg. Hours/Day</p>
                  <p className="heading-report text-2xl font-semibold mt-1 text-app-purple">
                    {weeklySummary.averageHours.toFixed(1)}h
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg">
                  <p className="text-[#222222] text-sm">Total Break</p>
                  <p className="heading-report text-2xl font-semibold mt-1 text-app-purple">
                    {weeklySummary.totalBreakTime.toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Logs Card */}
      <div className="mt-4" style={{ animationDelay: "0.2s" }}>
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
          <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
            <div className="flex items-center gap-2">
              <History className="text-app-purple" size={25} />
              <CardTitle className="text-lg font-bold">Recent Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {recentLogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {recentLogs.map((log) => {
                  const [totalHours, totalMinutes] = log.total_hours.split(':').map(Number);
                  const [breakHours, breakMinutes] = log.break_hours.split(':').map(Number);
                  const workHours = totalHours - breakHours;
                  const workMinutes = totalMinutes - breakMinutes;
                  return (
                    <div
                      key={log.date}
                      className="p-4 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-app-purple" />
                          <p className="text-[#222222]">
                            {format(parseISO(log.date), "EEE, MMM d")}
                          </p>
                        </div>
                        <div className="orange-background bg-gradient-to-b from-app-purple to-app-purple-dark px-2 py-1 rounded-full">
                          <p className="text-xs font-medium text-white">
                            {totalHours}h {totalMinutes}m
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-[#222222]">
                          {log.check_in} - {log.check_out}
                        </span>
                        <span className="text-[#222222]">
                          Break: {breakHours}h {breakMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[#222222]">No recent logs found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;