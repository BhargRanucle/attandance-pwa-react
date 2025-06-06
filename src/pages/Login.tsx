import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { isAuthenticated, login, verifyOtp, pendingPhone } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/time-logs" replace />;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(phone); 
      if (success) {
        setOtpSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyOtp(otp);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-app-purple-light to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gradient">Attendance</h1>
          <p className="text-muted-foreground">Track your work hours effortlessly</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              {otpSent
                ? "Enter the OTP sent to your mobile number"
                : "Enter your mobile number to receive an OTP"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-app-purple hover:bg-app-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    OTP sent to {pendingPhone}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-app-purple hover:bg-app-purple-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;