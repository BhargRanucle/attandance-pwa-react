import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone } from "lucide-react";

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
    <div className="flex min-h-screen flex-col justify-items-center place-items-center p-4 bg-gradient-to-t from-app-purple/70 to-app-purple-dark/10">
      <div className="loginPage w-full max-w-md justify-items-center">
        <div className="flex flex-col place-items-center justify-items-center mb-3">
          <img className="header-logoLogin" src="/logoLogin.png" alt="VARDAN" />
        </div>

        <Card className="w-full border-app-purple">
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
                    className="border-app-purple/20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold bg-gradient-to-b from-app-purple to-app-purple-dark py-6"
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