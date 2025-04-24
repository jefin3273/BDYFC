"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollText, Users, Home, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ChurchSidebarProps {
  churchName: string
}

export default function ChurchSidebar({ churchName }: ChurchSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false)
  }, [pathname])

  const links = [
    { href: "/church", label: "Dashboard", icon: Home },
    { href: "/church/members", label: "Members", icon: Users },
    { href: "/church/registrations", label: "Registrations", icon: ScrollText },
    { href: "/church/settings", label: "Settings", icon: Settings },
  ]

  // Mobile menu toggle button
  const MobileMenuToggle = () => (
    <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
      <h2 className="truncate text-lg font-semibold">
        {churchName.length > 20 ? `${churchName.substring(0, 20)}...` : churchName}
      </h2>
      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  )

  return (
    <>
      <MobileMenuToggle />

      <AnimatePresence>
        {(isMobileMenuOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300, opacity: 0 } : false}
            animate={isMobile ? { x: 0, opacity: 1 } : false}
            exit={isMobile ? { x: -300, opacity: 0 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative z-30 flex h-screen flex-col border-r bg-white transition-all duration-300",
              collapsed ? "w-16" : "w-64",
              isMobile ? "fixed left-0 top-0 shadow-lg" : "hidden md:flex",
            )}
          >
            <div className="hidden h-16 items-center border-b px-4 md:flex">
              {!collapsed && (
                <h2 className="truncate text-lg font-semibold">
                  {churchName.length > 20 ? `${churchName.substring(0, 20)}...` : churchName}
                </h2>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-white shadow-md md:flex hidden"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>

            <nav className="flex-1 space-y-1 p-2">
              {links.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-red-50 text-red-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
