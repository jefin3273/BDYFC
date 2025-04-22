import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash } from "lucide-react"
import { supabaseServer } from "@/lib/supabase"

async function getEvents() {
  const supabase = supabaseServer()

  const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data || []
}

export default async function AdminEventsPage() {
  const events = await getEvents()

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage all events</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>View and manage all events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const eventDate = new Date(event.event_date)
                  const isPast = eventDate < new Date()

                  return (
                    <tr key={event.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">{event.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        {format(eventDate, "MMM d, yyyy")}
                        <div className="text-sm text-muted-foreground">{format(eventDate, "h:mm a")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{event.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.is_online ? "Online Event" : "In-person"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            isPast ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isPast ? "Past" : "Upcoming"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/events/${event.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No events found. Create your first event to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
