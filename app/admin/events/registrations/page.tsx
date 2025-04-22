import { supabaseServer } from "@/lib/supabase"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"

async function getRegistrations() {
  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      *,
      events (id, title, event_date),
      registration_types (id, name)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching registrations:", error)
    return []
  }

  return data || []
}

export default async function AdminRegistrationsPage() {
  const registrations = await getRegistrations()

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Registrations</h1>
          <p className="text-muted-foreground">Manage all event registrations</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
          <CardDescription>View and manage all event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Attendees</th>
                  <th className="px-4 py-3 text-left font-medium">Registered On</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="font-medium">{registration.name}</div>
                      <div className="text-sm text-muted-foreground">{registration.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{registration.events?.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {registration.events?.event_date
                          ? format(new Date(registration.events.event_date), "MMM d, yyyy")
                          : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">{registration.registration_types?.name}</td>
                    <td className="px-4 py-3">{registration.number_of_attendees}</td>
                    <td className="px-4 py-3">{format(new Date(registration.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          registration.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {registration.payment_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}

                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                      No registrations found.
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
