import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Pause, LogOut, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import Layout from "@/components/Layout";
import DateRangePicker from "@/components/DateRangePicker";
import TimeDisplay from "@/components/TimeDisplay";

const TimeLogs = () => {
  const { user } = useAuth();
  const {
    isCheckedIn,
    elapsedTime,
    checkIn,
    checkOut,
    getFilteredLogs,
    totalBreakTimeToday,
    earliestCheckInTime,
    isLoading,
    fetchRangeLogs,
    dateFilteredTimeLogs,
    rangeStart,
    rangeEnd,
    setRange,
    locationBlocked,
    requestLocationPermission,
  } = useAttendance();

  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return d;
  });

  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const handleDateRangeChange = (start: Date, end: Date) => {
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
    setRange(s, e);
    fetchRangeLogs(s, e);
  };

  useEffect(() => {
    const formattedStart = startDate.toISOString().split("T")[0];
    const formattedEnd = endDate.toISOString().split("T")[0];
    fetchRangeLogs(formattedStart, formattedEnd);
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Time Logs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Current Status Card */}
        <div className="">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/30 to-transparent pb-2 px-4">
              <div className="flex items-center gap-2">
                <Clock className="text-app-purple" size={20} />
                <CardTitle className="text-lg font-medium">
                  Current Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-6 text-center py-2">
                {isLoading ? (
                  <div className="py-6">
                    <div className="w-24 h-24 mx-auto bg-app-light rounded-full flex items-center justify-center shadow-inner">
                      <Clock size={48} className="text-app-gray animate-pulse" />
                    </div>
                    <p className="text-muted-foreground mt-4">Loading time data...</p>
                  </div>
                ) : isCheckedIn ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">Working Time</p>
                    <div className="bg-gradient-to-br from-app-purple-light to-white p-5 rounded-full inline-block shadow-inner">
                      <TimeDisplay
                        seconds={elapsedTime}
                        pulsing={true}
                        size="lg"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <div className="w-24 h-24 mx-auto bg-app-light rounded-full flex items-center justify-center shadow-inner">
                      <Clock size={48} className="text-app-gray" />
                    </div>
                    <p className="text-muted-foreground mt-4">
                      You are not checked in
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!isCheckedIn ? (
                  <Button
                    onClick={checkIn}
                    className="log-button bg-gradient-to-r from-app-purple to-app-blue hover:opacity-90 col-span-2 py-6"
                  >
                    <Clock className="mr-2" size={20} />
                    Check In
                  </Button>
                ) : (
                  <Button
                    onClick={checkOut}
                    className="log-button bg-gradient-to-r from-app-red/90 to-app-red hover:opacity-90 py-4 col-span-2"
                  >
                    <LogOut className="mr-2" size={18} />
                    Check Out
                  </Button>
                )}
              </div>
              <div className="mt-6 p-4 bg-app-purple-light/20 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-app-purple" />
                    <p className="text-sm text-app-purple-dark font-medium">
                      Check-in time
                    </p>
                  </div>
                  <p className="font-medium">
                    {earliestCheckInTime ? format(earliestCheckInTime, "h:mm a") : "--:--"}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Pause size={16} className="text-app-purple" />
                    <p className="text-sm text-app-purple-dark font-medium">
                      Break time
                    </p>
                  </div>
                  <p className="font-medium">
                    {totalBreakTimeToday
                      ? `${Math.floor(totalBreakTimeToday / 3600)}h ${Math.floor((totalBreakTimeToday % 3600) / 60)}m`
                      : "0h 0m"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log History Card */}
        <div className="" style={{ animationDelay: "0.1s" }}>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-blue to-app-purple p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-light to-transparent pb-2 px-4">
              <div className="flex items-center gap-2">
                <History className="text-app-blue" size={20} />
                <CardTitle className="text-lg font-medium">
                  Log History
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Select date range
                </p>
                <DateRangePicker
                  startDate={rangeStart ? new Date(rangeStart) : undefined}
                  endDate={rangeEnd ? new Date(rangeEnd) : undefined}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              <div className="space-y-3 mt-6">
                {dateFilteredTimeLogs.length > 0 ? (
                  dateFilteredTimeLogs.map((log) => {
                    const { checkInTime, checkOutTime, breakTime, totalWorkSeconds } = log;
                    const workTimeSeconds = totalWorkSeconds;
                    const workHours = Math.floor(workTimeSeconds / 3600);
                    const workMinutes = Math.floor((workTimeSeconds % 3600) / 60);
                    const breakHours = Math.floor(breakTime / 3600);
                    const breakMinutes = Math.floor((breakTime % 3600) / 60);
                    const formattedBreakTime = `${breakHours}h ${breakMinutes}m`;
                    return (
                      <div
                        key={log.id}
                        className="p-4 bg-gradient-to-br from-white to-app-purple-light/95 rounded-lg shadow-sm"
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
                            {checkInTime ? format(checkInTime, "h:mm a") : "--:--"} - {checkOutTime ? format(checkOutTime, "h:mm a") : "--:--"}
                          </span>
                          <span className="text-muted-foreground">
                            Break: {formattedBreakTime}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-app-light/50 rounded-lg">
                    <Clock size={36} className="text-app-gray/40 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No logs found in the selected date range.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {locationBlocked && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Location access required
            </h2>

            <p className="mb-4">
              We need your device location to complete check-in / check-out.
            </p>

            <Button
              className="w-full mb-3 bg-app-blue text-white"
              onClick={requestLocationPermission}
            >
              Allow location
            </Button>

            <p className="text-sm text-muted-foreground">
              If you don’t see the browser prompt, enable location manually:
              <br />
              • Chrome: <kbd>Settings › Privacy & Security › Site Settings › Location</kbd>
              <br />
              • Safari (iOS): <kbd>Settings › Privacy › Location Services › Safari</kbd>
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TimeLogs;