import { supabaseServer } from "@/lib/supabase"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash, Mail, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

async function getMessages() {
  const supabase = supabaseServer()

  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return data || []
}

export default async function AdminMessagesPage() {
  const messages = await getMessages()

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage contact form messages</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export Messages
        </Button>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-bold">{message.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {message.is_read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                  {message.phone && <p className="text-sm text-muted-foreground">{message.phone}</p>}
                  <div className="mt-4">
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Mail className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Mark as {message.is_read ? "Unread" : "Read"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No messages found.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
