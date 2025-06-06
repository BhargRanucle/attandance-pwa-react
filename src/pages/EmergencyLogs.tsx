import { useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/DateRangePicker";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileImage,
  FileText,
  History,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

const EmergencyLogs = () => {
  const { isAuthenticated } = useAuth();
  const { submitEmergencyLog, getFilteredEmergencyLogs } = useAttendance();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClear, setIsClear] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitEmergencyLog(date, reason, imageBase64 || undefined);
      setReason("");
      setIsClear(!isClear);
      setImageBase64(null);
    } catch (error) {
      console.error("Error submitting emergency log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = getFilteredEmergencyLogs(
    startDate.toISOString().split("T")[0],
    endDate.toISOString().split("T")[0]
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Submit Emergency Log Card */}
        <div className="">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-app-purple" size={25} />
                <div>
                  <CardTitle className="text-lg font-bold">
                    Submit Emergency Log
                  </CardTitle>
                </div>
              </div>
              <div>
                <CardDescription className="text-left">
                  Request log for emergencies or absences
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <FileImage size={16} className="text-app-purple" />
                    <span>Upload Image</span>
                  </Label>
                  <ImageUpload
                    onImageChange={setImageBase64}
                    isClear={isClear}
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
                    className="min-h-[100px] bg-[#F6861F]/5 border-app-purple/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold bg-gradient-to-b from-app-purple to-app-purple-dark py-6"
                  disabled={isSubmitting}
                >
                  <AlertTriangle className="mr-0" size={18} />
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Log History Card */}
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
                />
              </div>

              <div className="space-y-4 mt-4">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2 px-2 bg-gradient-to-br from-white to-app-light rounded-lg shadow-sm"
                    >
                      <div className="text-sm">
                        <p className="text-app-purple font-medium">
                          {log.reason}
                        </p>
                      </div>

                      <div className="flex items-center mt-2">
                        <div className="flex items-center me-4">
                          <div>
                            <Badge
                              variant="outline"
                              className="font-normal text-xs bg-app-purple/5 border-app-purple/20"
                            >
                              {format(new Date(log.date), "MMM d")}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getStatusColor(log.status)}
                        >
                          {log.status.charAt(0).toUpperCase() +
                            log.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-[#F6861F]/5 rounded-lg">
                    <AlertTriangle
                      size={36}
                      className="text-app-purple/40 mx-auto mb-2"
                    />
                    <p className="text-muted-foreground">
                      No emergency logs found in the selected date range.
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

export default EmergencyLogs;
