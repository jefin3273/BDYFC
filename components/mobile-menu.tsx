"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Menu, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, userRole } = useAuth()

  return (
    <div className="md:hidden">
      <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} aria-label="Open menu">
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
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 top-0 h-full w-3/4 max-w-sm bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Menu</p>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="mt-8">
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block py-2 text-lg font-medium transition-colors hover:text-red-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-8 border-t pt-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {userRole && (
                          <p className="text-xs text-muted-foreground">
                            Role: <span className="capitalize">{userRole}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {(userRole === "admin" || userRole === "moderator" || userRole === "editor") && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 py-2 text-base font-medium transition-colors hover:text-red-600"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 py-2 text-base font-medium transition-colors hover:text-red-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="flex w-full items-center gap-2 py-2 text-base font-medium text-red-600 transition-colors hover:text-red-700"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth/login"
                      className="w-full rounded-md bg-red-600 py-2 text-center font-medium text-white transition-colors hover:bg-red-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="w-full rounded-md border border-red-600 py-2 text-center font-medium text-red-600 transition-colors hover:bg-red-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
