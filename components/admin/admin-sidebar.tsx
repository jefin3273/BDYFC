"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface AdminSidebarProps {
  userRole: string
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    events: true,
    users: false,
    gallery: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["admin", "moderator", "editor", "viewer"],
    },
    {
      title: "Events",
      icon: Calendar,
      roles: ["admin", "moderator", "editor"],
      children: [
        { title: "All Events", href: "/admin/events" },
        { title: "Add Event", href: "/admin/events/new" },
        { title: "Registrations", href: "/admin/events/registrations" },
      ],
    },
    {
      title: "Team Members",
      icon: Users,
      roles: ["admin", "moderator"],
      children: [
        { title: "All Members", href: "/admin/team" },
        { title: "Add Member", href: "/admin/team/new" },
      ],
    },
    {
      title: "Gallery",
      icon: ImageIcon,
      roles: ["admin", "moderator", "editor"],
      children: [
        { title: "All Images", href: "/admin/gallery" },
        { title: "Add Image", href: "/admin/gallery/new" },
      ],
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
      roles: ["admin", "moderator"],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-red-600">BDYFC</span>
          <span className="text-sm font-medium">Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              if (item.children) {
                return (
                  <Collapsible
                    key={item.title}
                    open={openSections[item.title.toLowerCase()]}
                    onOpenChange={() => toggleSection(item.title.toLowerCase())}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </div>
                        {openSections[item.title.toLowerCase()] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-6 space-y-1 pt-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-3 py-2 text-sm font-medium",
                              pathname === child.href
                                ? "bg-red-50 text-red-600 hover:bg-red-50 hover:text-red-600"
                                : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                            )}
                          >
                            {child.title}
                          </Button>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-red-50 text-red-600 hover:bg-red-50 hover:text-red-600"
                        : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )
            })}
        </nav>
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
