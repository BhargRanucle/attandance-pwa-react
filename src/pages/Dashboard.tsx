
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TimeDisplay from "@/components/TimeDisplay";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Clock, Calendar, LineChart, History } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const {
    isCheckedIn,
    isOnBreak,
    elapsedTime,
    todayLogs,
    allLogs,
    getWeeklySummary,
  } = useAttendance();

  const weeklySummary = getWeeklySummary();

  // Get the recent logs (excluding today's active log)
  const recentLogs = allLogs
    .filter(log => log.status === "completed")
    .slice(-3)
    .reverse();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Today's Log Card */}
        <div className="">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/80 to-app-blue/80 p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/30 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <Clock className="text-app-purple" size={20} />
                <CardTitle className="text-lg font-medium">
                  Today's Log - {format(new Date(), "EEEE, MMM d")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {isCheckedIn ? (
                <div className="flex flex-col items-center py-3 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isOnBreak ? "On Break" : "Working Time"}
                    </p>
                    <TimeDisplay seconds={elapsedTime} pulsing={true} size="lg" />
                  </div>

                  <div className="w-full grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-app-purple-light/30 rounded-md shadow-sm">
                      <span className="text-muted-foreground mb-1">Check In</span>
                      <span className="font-medium">
                        {format(new Date(), "h:mm a")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-app-purple-light/30 rounded-md shadow-sm">
                      <span className="text-muted-foreground mb-1">Break Time</span>
                      <span className="font-medium">
                        {Math.floor(todayLogs[0]?.totalBreakTime / 60) || 0} min
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
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
            <div className="bg-gradient-to-r from-app-blue/80 to-app-purple/80 p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-light to-transparent pb-2">
              <div className="flex items-center gap-2">
                <LineChart className="text-app-blue" size={20} />
                <CardTitle className="text-lg font-medium">Weekly Report</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-light rounded-lg">
                  <p className="text-muted-foreground text-sm">Total Hours</p>
                  <p className="text-2xl font-semibold mt-1 text-app-purple">
                    {weeklySummary.totalHours.toFixed(1)}h
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-light rounded-lg">
                  <p className="text-muted-foreground text-sm">Present Days</p>
                  <p className="text-2xl font-semibold mt-1 text-app-purple">
                    {/* {`${weeklySummary.presentDays}/5`} */}
                    {`4/5`}
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-light rounded-lg">
                  <p className="text-muted-foreground text-sm">Avg. Hours/Day</p>
                  <p className="text-2xl font-semibold mt-1 text-app-blue">
                    {weeklySummary.averageHours.toFixed(1)}h
                  </p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-white to-app-light rounded-lg">
                  <p className="text-muted-foreground text-sm">Total Break</p>
                  <p className="text-2xl font-semibold mt-1 text-app-blue">
                    {weeklySummary.totalBreakTime.toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Logs Card */}
        <div className="" style={{ animationDelay: "0.2s" }}>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple-dark/80 to-app-purple/80 p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/30 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <History className="text-app-purple-dark" size={20} />
                <CardTitle className="text-lg font-medium">Recent Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log) => {
                    // Calculate total work time (excluding breaks)
                    const checkInTime = new Date(log.checkInTime);
                    const checkOutTime = log.checkOutTime ? new Date(log.checkOutTime) : new Date();
                    const totalSeconds = (checkOutTime.getTime() - checkInTime.getTime()) / 1000;
                    const workTimeSeconds = totalSeconds - log.totalBreakTime;
                    const workHours = Math.floor(workTimeSeconds / 3600);
                    const workMinutes = Math.floor((workTimeSeconds % 3600) / 60);
                    const breakMinutes = Math.floor(log.totalBreakTime / 60);
                    
                    return (
                      <div 
                        key={log.id} 
                        className="p-4 bg-gradient-to-br from-white to-app-purple-light/20 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-app-purple-dark" />
                            <p className="font-medium">
                              {format(new Date(log.date), "EEE, MMM d")}
                            </p>
                          </div>
                          <div className="bg-app-purple/10 px-2 py-1 rounded-full">
                            <p className="text-xs font-medium text-app-purple">
                              {workHours}h {workMinutes}m
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {format(checkInTime, "h:mm a")} - {format(checkOutTime, "h:mm a")}
                          </span>
                          <span className="text-muted-foreground">
                            Break: {breakMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">No recent logs found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
