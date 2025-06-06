
import React, { useState, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Building, MapPin, Camera, Phone } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg, { Crop } from "@/utils/cropImage";
import CropperModal from "@/utils/CropperModal";


const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    department: user?.department || "",
    address: user?.address || "",
    profilePicture: user?.profilePicture || "",
  });

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Crop | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData((prev) => ({ ...prev, profilePicture: croppedImageUrl }));
  };


  // Handle crop complete event to get cropped area pixels
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  // Save cropped image and update profile picture
  const onCropSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      setFormData((prev) => ({ ...prev, profilePicture: croppedImageUrl }));
      setCropModalOpen(false);
    }
  };

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
        <div className="w-[100%] lg:w-[50%] mx-auto">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="bg-gradient-to-r from-app-purple to-app-blue p-1"></div>
            <CardHeader className="bg-gradient-to-b from-app-purple-light/10 to-transparent pb-2 text-center">
              <div className="flex justify-center mb-2">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-app-white shadow-lg">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-b from-app-purple to-app-purple-dark text-white text-2xl">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl font-bold text-black">{user?.username}</CardTitle>
              <CardDescription className="text-lg font-bold text-black">{user?.phone}</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-5 mt-2">
                  <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-bl from-white to-app-purple-light/30 rounded-lg transition-all">
                      <div className="w-9 h-9 bg-app-purple/70 rounded-full flex items-center justify-center">
                        <Mail size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-left text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-left">{user?.email || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-bl from-white to-app-purple-light/30 rounded-lg transition-all">
                      <div className="w-9 h-9 bg-app-purple/70 rounded-full flex items-center justify-center">
                        <Building size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-left text-muted-foreground">Department</p>
                        <p className="text-sm font-medium text-left">{user?.department || "Not set"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-bl from-white to-app-purple-light/30 rounded-lg transition-all">
                      <div className="w-9 h-9 bg-app-purple/70 rounded-full flex items-center justify-center">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-left text-muted-foreground">Address</p>
                        <p className="text-sm font-medium text-left">{user?.address || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full font-bold bg-gradient-to-b from-app-purple to-app-purple-dark py-6"
                  >
                    <User className="mr-0" size={18} />
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
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs border-app-purple/20 change-photo"
                    >
                      <Camera size={14} className="mr-0 text-app-purple" />
                      Change Photo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
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
                      className="border-app-purple/20"
                    />
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
                        className="border-app-purple/20"
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
                        className="border-app-purple/20"
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
                      className="min-h-[80px] border-app-purple/20"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 text-white font-bold bg-gradient-to-t from-app-red to-app-red-dark py-6"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 font-bold bg-gradient-to-t from-app-green to-app-green-dark py-6"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        {
          showCropper && selectedImage && (
            <CropperModal
              image={selectedImage}
              onCancel={() => setShowCropper(false)}
              onCropComplete={(croppedImage: string) => {
                setFormData((prev) => ({
                  ...prev,
                  profilePicture: croppedImage,
                }));
                setShowCropper(false);
              }}
            />
          )
        }
      </div>
    </Layout>

  );
};

export default Profile;
