import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, UserCheck, Clock } from "lucide-react"
import { supabaseServer } from "@/lib/supabase"

export default async function ChurchDashboard() {
  const supabase = supabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get church details
  const { data: churchData } = await supabase.from("churches").select("*").eq("user_id", session?.user.id).single()

  // Get church members count
  const { count: membersCount } = await supabase
    .from("church_members")
    .select("*", { count: "exact", head: true })
    .eq("church_id", churchData?.id)

  // Get upcoming events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(5)

  // Get recent registrations
  const { data: recentRegistrations } = await supabase
    .from("registrations")
    .select("*, events(title)")
    .eq("church_id", churchData?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="container space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{churchData?.name} Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your church dashboard</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Church members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Events in the next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Registrations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentRegistrations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Current event registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {churchData?.updated_at
                ? new Date(churchData.updated_at).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Profile last updated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events you can register for</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                    <a href={`/events/${event.slug}`} className="text-sm font-medium text-red-600 hover:underline">
                      View Details
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Your church's recent event registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRegistrations && recentRegistrations.length > 0 ? (
              <div className="space-y-4">
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{registration.events?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        registration.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent registrations</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
