"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Menu, User, LogOut, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  // { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();

  // Close the menu when clicking outside or when the route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('[data-mobile-menu="true"]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              data-mobile-menu="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 top-0 h-screen w-[85%] max-w-sm bg-white p-0 shadow-xl flex flex-col"
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <p className="text-lg font-semibold">Menu</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="h-[calc(100%-4rem)] overflow-y-auto pb-20">
                <nav className="p-4">
                  <ul className="space-y-1">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-md py-3 text-base font-medium transition-colors hover:bg-gray-100 hover:text-red-600"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="border-t p-4">
                  {/* {user ? (
                    <div className="space-y-4">
                      <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {userRole && (
                              <p className="text-xs text-muted-foreground">
                                Role:{" "}
                                <span className="capitalize">{userRole}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {(userRole === "admin" ||
                        userRole === "moderator" ||
                        userRole === "editor") && (
                          <Link
                            href="/admin"
                            className="flex w-full items-center justify-between rounded-md py-3 text-base font-medium transition-colors hover:bg-gray-100 hover:text-red-600"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <Settings className="h-5 w-5" />
                              <span>Admin Dashboard</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </Link>
                        )}

                      {userRole === "church" && (
                        <Link
                          href="/church"
                          className="flex w-full items-center justify-between rounded-md py-3 text-base font-medium transition-colors hover:bg-gray-100 hover:text-red-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5" />
                            <span>Church Dashboard</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        className="flex w-full items-center justify-between rounded-md py-3 text-base font-medium transition-colors hover:bg-gray-100 hover:text-red-600"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5" />
                          <span>My Profile</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>

                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/auth/login"
                        className="w-full rounded-md bg-red-600 py-3 text-center font-medium text-white transition-colors hover:bg-red-700"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        className="w-full rounded-md border border-red-600 py-3 text-center font-medium text-red-600 transition-colors hover:bg-red-50"
                        onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )} */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
