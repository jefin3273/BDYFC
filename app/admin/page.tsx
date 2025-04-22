import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, ImageIcon, MessageSquare } from "lucide-react"
import { supabaseServer } from "@/lib/supabase"

async function getDashboardStats() {
  const supabase = supabaseServer()

  const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true })
  const { count: teamCount } = await supabase.from("team_members").select("*", { count: "exact", head: true })
  const { count: galleryCount } = await supabase.from("gallery_images").select("*", { count: "exact", head: true })
  const { count: messagesCount } = await supabase.from("contact_messages").select("*", { count: "exact", head: true })
  const { count: registrationsCount } = await supabase.from("registrations").select("*", { count: "exact", head: true })

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(5)

  // Get recent messages
  const { data: recentMessages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    eventsCount: eventsCount || 0,
    teamCount: teamCount || 0,
    galleryCount: galleryCount || 0,
    messagesCount: messagesCount || 0,
    registrationsCount: registrationsCount || 0,
    upcomingEvents: upcomingEvents || [],
    recentMessages: recentMessages || [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the BDYFC admin dashboard</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <h3 className="text-2xl font-bold">{stats.eventsCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <h3 className="text-2xl font-bold">{stats.teamCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gallery Images</p>
                <h3 className="text-2xl font-bold">{stats.galleryCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <h3 className="text-2xl font-bold">{stats.messagesCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next {stats.upcomingEvents.length} events on the calendar</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className={`rounded-full px-2 py-1 text-xs font-medium ${event.color} text-white`}>
                      {event.is_online ? "Online" : "In-person"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest messages from the contact form</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentMessages.length > 0 ? (
              <div className="space-y-4">
                {stats.recentMessages.map((message) => (
                  <div key={message.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{message.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{message.email}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No messages received</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Registration Statistics</CardTitle>
            <CardDescription>Overview of event registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-5xl font-bold text-red-600">{stats.registrationsCount}</h3>
                <p className="mt-2 text-muted-foreground">Total Registrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
