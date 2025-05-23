import { useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/DateRangePicker";
import TimeDisplay from "@/components/TimeDisplay";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Clock, Calendar, Play, Pause, LogOut, History } from "lucide-react";

const TimeLogs = () => {
  const { isAuthenticated } = useAuth();
  const {
    isCheckedIn,
    isOnBreak,
    elapsedTime,
    breakTime,
    currentLog,
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    getFilteredLogs,
  } = useAttendance();

  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });

  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const filteredLogs = getFilteredLogs(
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
  )
    .filter((log) => log.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const [latLong, setLatLong] = useState() as any;
  // const getCurrentLocation = () => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setLatLong({
  //           lat: position.coords.latitude,
  //           long: position.coords.longitude,
  //         });
  //       },
  //       (error) => {
  //         if (error.code === error.PERMISSION_DENIED) {
  //           alert("Location permission is denied. Please enable.");
  //         } else {
  //           console.error("Error accessing location:", error.message);
  //         }
  //       }
  //     );
  //   } else {
  //     console.error("Geolocation is not supported by this browser.");
  //   }
  // };

  // const checkLocationPermission = async () => {
  //   try {
  //     const permissionStatus = await navigator.permissions.query({
  //       name: "geolocation",
  //     });

  //     if (permissionStatus.state === "denied") {
  //       alert(
  //         "Location permission is denied. Please update your browser settings to enable it."
  //       );
  //     } else {
  //       getCurrentLocation();
  //     }
  //   } catch (error) {
  //     console.error("Error checking permissions:", error);
  //   }
  // };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatLong({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert(
              "Location permission denied. Please enable it in browser settings."
            );
          } else {
            console.error("Error accessing location:", error.message);
          }
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };
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
                {isCheckedIn ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">
                      {isOnBreak ? "On Break" : "Working Time"}
                    </p>
                    <div className="bg-gradient-to-br from-app-purple-light to-white p-5 rounded-full inline-block shadow-inner">
                      <TimeDisplay
                        seconds={isOnBreak ? breakTime : elapsedTime}
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
                  <>
                    <Button
                      onClick={checkOut}
                      className="log-button bg-gradient-to-r from-app-red/90 to-app-red hover:opacity-90 py-4"
                    >
                      <LogOut className="mr-2" size={18} />
                      Check Out
                    </Button>
                    {!isOnBreak ? (
                      <Button
                        onClick={startBreak}
                        className="log-button bg-gradient-to-r from-app-blue to-app-blue/80 hover:opacity-90 py-4"
                      >
                        <Pause className="mr-2" size={18} />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        onClick={endBreak}
                        className="log-button bg-gradient-to-r from-app-blue/80 to-app-blue hover:opacity-90 py-4"
                      >
                        <Play className="mr-2" size={18} />
                        End Break
                      </Button>
                    )}
                  </>
                )}
              </div>

              {latLong?.lat && latLong?.long ? (
                <div className="text-xs text-center bg-app-blue/10 px-2 py-1 rounded-full text-app-blue w-full mt-2">
                  {`Latitude: ${latLong.lat}, Longitude: ${latLong.long}`}
                </div>
              ) : (
                <Button
                  onClick={getCurrentLocation}
                  className="log-button bg-gradient-to-r from-app-purple to-app-blue hover:opacity-90 col-span-2 py-6 w-full mt-2"
                >
                  Turn On Location
                </Button>
              )}
              {isCheckedIn && currentLog && (
                <div className="mt-6 p-4 bg-app-purple-light/20 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-app-purple" />
                      <p className="text-sm text-app-purple-dark font-medium">
                        Check-in time
                      </p>
                    </div>
                    <p className="font-medium">
                      {format(new Date(currentLog.checkInTime), "h:mm a")}
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
                      {Math.floor(currentLog.totalBreakTime / 60)} min
                    </p>
                  </div>
                </div>
              )}
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
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              <div className="space-y-3 mt-6">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    // Calculate total work time (excluding breaks)
                    const checkInTime = new Date(log.checkInTime);
                    const checkOutTime = log.checkOutTime
                      ? new Date(log.checkOutTime)
                      : new Date();
                    const totalSeconds =
                      (checkOutTime.getTime() - checkInTime.getTime()) / 1000;
                    const workTimeSeconds = totalSeconds - log.totalBreakTime;
                    const workHours = Math.floor(workTimeSeconds / 3600);
                    const workMinutes = Math.floor(
                      (workTimeSeconds % 3600) / 60
                    );
                    const breakMinutes = Math.floor(log.totalBreakTime / 60);

                    return (
                      <div
                        key={log.id}
                        className="p-4 bg-gradient-to-br from-white to-app-purple-light/95 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={16}
                              className="text-app-purple-dark"
                            />
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
                            {format(checkInTime, "h:mm a")} -{" "}
                            {format(checkOutTime, "h:mm a")}
                          </span>
                          <span className="text-muted-foreground">
                            Break: {breakMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-app-light/50 rounded-lg">
                    <Clock
                      size={36}
                      className="text-app-gray/40 mx-auto mb-2"
                    />
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
    </Layout>
  );
};

export default TimeLogs;
