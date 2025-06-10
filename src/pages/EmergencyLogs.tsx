import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DateRangePicker from "@/components/DateRangePicker";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  FileImage,
  FileText,
  History,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";
import Loader from '../components/Loader';

const EmergencyLogs = () => {
  const API_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("staffuser_token");
  const { isAuthenticated, user } = useAuth();
  const [reason, setReason] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_URL}create-gallery-log`,
        {
          user_id: user.id,
          description: reason,
          image: imageBase64?.replace(/^data:image\/\w+;base64,/, ""),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReason("");
      setImageBase64(null);
      setIsClear(true);
      await fetchFilteredLogs(startDate, endDate);
    } catch (error) {
      console.error("Error submitting emergency log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFilteredLogs = async (start: Date, end: Date) => {
    setIsLoading(true);
    setErrorLogs(null);
    try {
      console.log("Calling API with:", { startDate, endDate });
      const response = await axios.post(
        `${API_URL}emergency-log`,
        {
          user_id: user.id,
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data && Array.isArray(response.data.data)) {
        const logs = response.data.data;
        setFilteredLogs(
          logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      } else {
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Error fetching filtered logs:", error);
      setErrorLogs("Failed to load logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredLogs(startDate, endDate);
  }, [startDate, endDate]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Layout title="Emergency Logs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Submit Emergency Log Card */}
        <div>
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
                  <ImageUpload onImageChange={setImageBase64} isClear={isClear} />
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
        <div style={{ animationDelay: "0.1s" }}>
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple/100 to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2">
              <div className="flex items-center gap-2">
                <History className="text-app-purple" size={25} />
                <CardTitle className="text-lg font-bold">Log History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              <div className="space-y-4 mt-4">
                {errorLogs ? (
                  <p className="text-red-600">{errorLogs}</p>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2 px-2 bg-gradient-to-br from-white to-app-light rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <p className="text-app-purple font-medium">
                            {log.description || "No description provided"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-normal text-xs bg-app-purple/5 border-app-purple/20"
                        >
                          {format(new Date(log.created_at), "MMM d, yyyy")}
                        </Badge>
                      </div>
                      {log.image_path && (
                        <div className="mt-2">
                          <img
                            src={`data:image/png;base64,${log.image_path}`}
                            alt="Emergency log"
                            className="w-[25%] h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(log.image_path)}
                          />
                        </div>
                      )}
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

              {/* Image Modal */}
              <Dialog
                open={!!selectedImage}
                onOpenChange={(open) => !open && setSelectedImage(null)}
              >
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none">
                  {selectedImage && (
                    <img
                      src={`data:image/png;base64,${selectedImage}`}
                      alt="Enlarged emergency log"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmergencyLogs;