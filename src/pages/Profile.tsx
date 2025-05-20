
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Building, MapPin, Camera } from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    department: user?.department || "",
    address: user?.address || "",
    profilePicture: user?.profilePicture || "",
  });

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  // Handle profile picture update
  const handleProfilePictureChange = () => {
    // In a real app, this would upload a file
    // For this demo, we'll use a placeholder
    const randomId = Math.floor(Math.random() * 1000);
    const newPicture = `https://i.pravatar.cc/150?img=${randomId}`;
    
    setFormData((prev) => ({ ...prev, profilePicture: newPicture }));
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="My Profile">
      <div className="space-y-6">
        <div className="animate-fade-in">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-light to-transparent pb-2 text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-app-purple shadow-lg">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-app-purple to-app-blue text-white text-2xl">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl md:text-2xl font-medium bg-gradient-to-r from-app-purple to-app-blue bg-clip-text text-transparent">{user?.username}</CardTitle>
              <CardDescription className="text-app-purple-dark">{user?.phone}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-5 mt-2">
                  <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    <div className="flex items-center gap-3 p-3 bg-app-purple/5 rounded-lg transition-all hover:bg-app-purple/10">
                      <div className="w-9 h-9 bg-app-purple/10 rounded-full flex items-center justify-center">
                        <Mail size={18} className="text-app-purple" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-app-purple/5 rounded-lg transition-all hover:bg-app-purple/10">
                      <div className="w-9 h-9 bg-app-purple/10 rounded-full flex items-center justify-center">
                        <Building size={18} className="text-app-purple" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-medium">{user?.department || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-app-purple/5 rounded-lg md:col-span-2 transition-all hover:bg-app-purple/10">
                      <div className="w-9 h-9 bg-app-purple/10 rounded-full flex items-center justify-center">
                        <MapPin size={18} className="text-app-purple" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-medium break-words">{user?.address || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 bg-gradient-to-r from-app-purple to-app-blue hover:opacity-90 py-6"
                  >
                    <User className="mr-2" size={18} />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div className="text-center mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleProfilePictureChange}
                      className="text-xs border-app-purple/20 hover:bg-app-purple/5"
                    >
                      <Camera size={14} className="mr-1 text-app-purple" />
                      Change Photo
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-1">
                      <User size={14} className="text-app-purple" />
                      <span>Username</span>
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="border-app-purple/20 focus:border-app-purple/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <span className="text-app-purple">📞</span>
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="phone"
                      value={user?.phone}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Phone number cannot be changed
                    </p>
                  </div>
                  
                  <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail size={14} className="text-app-purple" />
                        <span>Email</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-app-purple/20 focus:border-app-purple/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department" className="flex items-center gap-1">
                        <Building size={14} className="text-app-purple" />
                        <span>Department</span>
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="border-app-purple/20 focus:border-app-purple/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      <MapPin size={14} className="text-app-purple" />
                      <span>Address</span>
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="min-h-[80px] border-app-purple/20 focus:border-app-purple/50"
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-app-purple/20 hover:bg-app-purple/5"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-app-purple to-app-blue hover:opacity-90"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
