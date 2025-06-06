
import React from "react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showNav?: boolean;
  showProfile?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showNav = true,
  showProfile = true
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 md:px-6 lg:px-8 bg-[#222222] shadow-md">
        {/* <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-app-purple to-app-blue bg-clip-text text-transparent">{title}</h1> */}
        <img className="header-logo" src="/logo.png" alt="VARDAN" />
        {showProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 transition-colors">
                <AvatarImage src={user?.profilePicture || ""} />
                <AvatarFallback className="bg-gradient-to-r from-app-purple to-app-purple-dark text-white border-2 border-app-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-app-purple/20 shadow-lg ">
              <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-app-red cursor-pointer">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-gradient-to-b from-white to-app-white w-full">
        <div className="">
          <div className="">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom navigation - only shown on mobile */}
      {/* {showNav && isMobile && <BottomNav />} */}
      <BottomNav />
    </div>
  );
};

export default Layout;
