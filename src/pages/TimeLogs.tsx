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
import { Clock, Calendar, Play, Pause, LogOut, History, AlarmClock } from "lucide-react";

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
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <Clock className="text-app-purple" size={25} />
                <CardTitle className="text-lg font-bold">
                  Current Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-6 text-center py-2">
                {isCheckedIn ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-5">
                      {isOnBreak ? "On Break" : "Working Time"}
                    </p>
                    <div className="bg-[#222222]/10 text-black p-10 rounded-full inline-block shadow-inner">
                      <TimeDisplay
                        seconds={isOnBreak ? breakTime : elapsedTime}
                        pulsing={true}
                        size="lg"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-b from-app-purple to-app-purple-dark rounded-full flex items-center justify-center shadow-inner">
                      <Clock size={50} className="text-app-white" />
                    </div>
                    <p className="text-muted-foreground mt-2">
                      You are not checked in
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!isCheckedIn ? (
                  <Button
                    onClick={checkIn}
                    className="log-button font-bold bg-gradient-to-b from-app-purple to-app-purple-dark col-span-2 py-6"
                  >
                    <AlarmClock className="mr-0" size={25} />
                    Check In
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={checkOut}
                      className="log-button font-bold bg-gradient-to-t from-app-red to-app-red-dark py-6"
                    >
                      <LogOut className="mr-0" size={18} />
                      Check Out
                    </Button>
                    {!isOnBreak ? (
                      <Button
                        onClick={startBreak}
                        className="log-button font-bold bg-gradient-to-b from-app-blue to-app-purple-dark py-6"
                      >
                        <Pause className="mr-0" size={18} />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        onClick={endBreak}
                        className="log-button font-bold bg-gradient-to-b from-app-blue to-app-purple-dark py-6"
                      >
                        <Play className="mr-0" size={18} />
                        End Break
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* {latLong?.lat && latLong?.long ? (
                <div className="text-xs text-center bg-app-blue/10 px-2 py-1 rounded-full text-app-blue w-full mt-2">
                  {`Latitude: ${latLong.lat}, Longitude: ${latLong.long}`}
                </div>
              ) : (
                <Button
                  onClick={getCurrentLocation}
                  className="log-button bg-gradient-to-r from-app-purple to-app-blue col-span-2 py-6 w-full mt-2"
                >
                  Turn On Location
                </Button>
              )} */}
              {isCheckedIn && currentLog && (
                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {/* <Clock size={16} className="text-app-purple" /> */}
                      <p className="text-[#222222]">
                        Check-in time
                      </p>
                    </div>
                    <p className="text-md font-semibold">
                      {format(new Date(currentLog.checkInTime), "h:mm a")}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      {/* <Pause size={16} className="text-app-purple" /> */}
                      <p className="text-[#222222]">
                        Break time
                      </p>
                    </div>
                    <p className="text-md font-semibold">
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
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <History className="text-app-purple" size={25} />
                <CardTitle className="text-lg font-bold">
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
                  className=""
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
                        className="p-4 bg-gradient-to-br from-white to-app-purple-light/30 rounded-lg shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={16}
                              className="text-app-purple"
                            />
                            <p className="text-[#222222]">
                              {format(new Date(log.date), "EEE, MMM d")}
                            </p>
                          </div>
                          <div className="orange-background bg-gradient-to-b from-app-purple to-app-purple-dark px-2 py-1 rounded-full">
                            <p className="text-xs font-medium text-white">
                              {workHours}h {workMinutes}m
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-[#222222]">
                            {format(checkInTime, "h:mm a")} -{" "}
                            {format(checkOutTime, "h:mm a")}
                          </span>
                          <span className="text-[#222222]">
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
