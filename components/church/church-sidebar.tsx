"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollText, Users, Home, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface ChurchSidebarProps {
  churchName: string
}

export default function ChurchSidebar({ churchName }: ChurchSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const links = [
    { href: "/church", label: "Dashboard", icon: Home },
    { href: "/church/members", label: "Members", icon: Users },
    { href: "/church/registrations", label: "Registrations", icon: ScrollText },
    { href: "/church/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <h2 className="truncate text-lg font-semibold">
            {churchName.length > 20 ? `${churchName.substring(0, 20)}...` : churchName}
          </h2>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-white shadow-md"
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
    </div>
  )
}
