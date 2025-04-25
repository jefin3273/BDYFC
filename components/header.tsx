"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
const roleConfig: RoleConfigType = {
  admin: { dashboardPath: "/admin", icon: UserCog, label: "Admin Dashboard" },
  moderator: {
    dashboardPath: "/moderator",
    icon: Users,
    label: "Moderator Dashboard",
  },
  editor: {
    dashboardPath: "/editor",
    icon: FileEdit,
    label: "Editor Dashboard",
  },
  viewer: { dashboardPath: "/viewer", icon: Eye, label: "Viewer Dashboard" },
  church: { dashboardPath: "/church", icon: Church, label: "Church Dashboard" },
  user: { dashboardPath: "/", icon: User, label: "User Dashboard" },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, userRole } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get role configuration if available
  const roleData =
    userRole && roleConfig[userRole as RoleType]
      ? roleConfig[userRole as RoleType]
      : null;

  // Get first letter of email for avatar fallback
  const getInitial = () => {
    return user?.email ? user.email[0].toUpperCase() : "U";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Image
              src="/logo.png"
              alt="BDYFC Logo"
              width={50}
              height={50}
              className="h-12 w-12"
            />
          </motion.div>
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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-red-200 hover:ring-red-400 transition-all duration-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-medium">
                    {getInitial()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex items-center justify-start gap-3 p-3 bg-red-50 rounded-md mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-medium">
                    {getInitial()}
                  </div>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-gray-800">{user.email}</p>
                    {userRole && (
                      <p className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full w-fit">
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
                        className="cursor-pointer flex items-center p-2 rounded-md hover:bg-red-50"
                      >
                        <roleData.icon className="mr-2 h-4 w-4 text-red-600" />
                        <span>{roleData.label}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                  </>
                )}

                <DropdownMenuItem asChild className="mb-1">
                  <Link
                    href="/profile"
                    className="cursor-pointer flex items-center p-2 rounded-md hover:bg-red-50"
                  >
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  className="cursor-pointer flex items-center p-2 rounded-md text-red-600 hover:bg-red-50"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
