"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MobileMenu from "./mobile-menu";
import { usePathname } from "next/navigation";
// import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  UserCog,
  Users,
  Church,
  Eye,
  FileEdit,
  LucideIcon,
  ChevronDown,
} from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

// Define role types
type RoleType = "admin" | "moderator" | "editor" | "viewer" | "church" | "user";

// Define role configuration type
type RoleConfigType = {
  [key in RoleType]: {
    dashboardPath: string;
    icon: LucideIcon;
    label: string;
  };
};

// Define role-based navigation and icons
// const roleConfig: RoleConfigType = {
//   admin: { dashboardPath: "/admin", icon: UserCog, label: "Admin Dashboard" },
//   moderator: {
//     dashboardPath: "/moderator",
//     icon: Users,
//     label: "Moderator Dashboard",
//   },
//   editor: {
//     dashboardPath: "/editor",
//     icon: FileEdit,
//     label: "Editor Dashboard",
//   },
//   viewer: { dashboardPath: "/viewer", icon: Eye, label: "Viewer Dashboard" },
//   church: { dashboardPath: "/church", icon: Church, label: "Church Dashboard" },
//   user: { dashboardPath: "/", icon: User, label: "User Dashboard" },
// };

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // const { user, signOut, userRole } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get role configuration if available
  // const roleData =
  //   userRole && roleConfig[userRole as RoleType]
  //     ? roleConfig[userRole as RoleType]
  //     : null;

  // // Get first letter of email for avatar fallback
  // const getInitial = () => {
  //   return user?.email ? user.email[0].toUpperCase() : "U";
  // };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="BDYFC Logo" width={40} height={40} />
          <span className="hidden text-xl font-bold sm:inline-block">
            BDYFC
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium transition-colors hover:text-red-600 group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {/* {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 pr-3 pl-1 py-1 rounded-full bg-gradient-to-r from-red-50 to-white hover:from-red-100 hover:to-red-50 border border-red-200 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-medium shadow-inner">
                    {getInitial()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 truncate max-w-[100px]">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 rounded-xl shadow-lg border-red-100"
                sideOffset={8}
              >
                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-white rounded-lg mb-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-xl font-medium shadow-md mb-3">
                    {getInitial()}
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <p className="font-medium text-gray-800 text-center">
                      {user.email}
                    </p>
                    {userRole && (
                      <p className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full w-fit">
                        <span className="capitalize">{userRole}</span>
                      </p>
                    )}
                  </div>
                </div>

                {roleData && (
                  <>
                    <DropdownMenuItem asChild className="mb-1">
                      <Link
                        href={roleData.dashboardPath}
                        className="cursor-pointer flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <roleData.icon className="mr-3 h-5 w-5 text-red-600" />
                        <span className="font-medium">{roleData.label}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                  </>
                )}

                <DropdownMenuItem asChild className="mb-1">
                  <Link
                    href="/profile"
                    className="cursor-pointer flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <User className="mr-3 h-5 w-5 text-gray-600" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
              >
                Sign In
              </Button>
            </Link>
          )} */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
