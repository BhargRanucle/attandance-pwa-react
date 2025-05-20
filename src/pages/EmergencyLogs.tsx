import { useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/DateRangePicker";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { AlertTriangle, Calendar, Clock, FileText, History } from "lucide-react";

const EmergencyLogs = () => {
  const { isAuthenticated } = useAuth();
  const { submitEmergencyLog, getFilteredEmergencyLogs } = useAttendance();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");
  const [hours, setHours] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      submitEmergencyLog(date, reason, hours);
      setReason("");
      setHours(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = getFilteredEmergencyLogs(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <Layout title="Emergency Logs">
      <div className="space-y-6">
        {/* Submit Emergency Log Card */}
        <div className="animate-fade-in">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-red/80 to-app-purple/80 p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-light to-transparent pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-app-red" size={20} />
                <div>
                  <CardTitle className="text-lg font-medium">Submit Emergency Log</CardTitle>
                  <CardDescription>Request log for emergencies or absences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar size={16} className="text-app-purple" />
                    <span>Date</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="border-app-purple/20 focus:border-app-purple/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="flex items-center gap-1">
                    <FileText size={16} className="text-app-purple" />
                    <span>Reason</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain your reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="min-h-[100px] border-app-purple/20 focus:border-app-purple/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="flex items-center gap-1">
                    <Clock size={16} className="text-app-purple" />
                    <span>Hours Requested</span>
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    required
                    className="border-app-purple/20 focus:border-app-purple/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-app-purple to-app-red hover:opacity-90 py-6"
                  disabled={isSubmitting}
                >
                  <AlertTriangle className="mr-2" size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Log History Card */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/80 to-app-red/80 p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-light to-transparent pb-2">
              <div className="flex items-center gap-2">
                <History className="text-app-purple-dark" size={20} />
                <CardTitle className="text-lg font-medium">Log History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Select date range</p>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              <div className="space-y-4 mt-4">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-4 bg-gradient-to-br from-white to-app-light rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-app-purple-light/40 rounded-full flex items-center justify-center mr-3">
                            <AlertTriangle size={18} className="text-app-purple" />
                          </div>
                          <div>
                            <Badge 
                              variant="outline" 
                              className="mb-1 font-normal text-xs bg-app-purple/5 border-app-purple/20"
                            >
                              {format(new Date(log.date), "MMM d")}
                            </Badge>
                            <p className="font-medium">
                              {log.hours} hour{log.hours > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(log.status)}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm bg-app-purple/5 p-3 rounded-lg">
                        <p className="text-app-purple-dark font-medium mb-1">Reason:</p>
                        <p className="text-muted-foreground">{log.reason}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-app-light/50 rounded-lg">
                    <AlertTriangle size={36} className="text-app-gray/40 mx-auto mb-2" />
                    <p className="text-muted-foreground">No emergency logs found in the selected date range.</p>
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

export default EmergencyLogs;
