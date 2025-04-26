"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminMessagesPage({
  messages: initialMessages,
}: {
  messages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages || []);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleToggleRead(
    messageId: number,
    currentStatus: boolean
  ): Promise<void> {
    try {
      const { error }: { error: Error | null } = await supabase
        .from("contact_messages")
        .update({ is_read: !currentStatus })
        .eq("id", messageId);

      if (error) throw error;

      setMessages(
        messages.map((msg: Message) =>
          msg.id === messageId ? { ...msg, is_read: !currentStatus } : msg
        )
      );

      router.refresh();
    } catch (error) {
      console.error("Error updating message:", error);
    }
  }

  interface DeleteResponse {
    error: Error | null;
  }

  async function handleDelete(messageId: number): Promise<void> {
    try {
      const { error }: DeleteResponse = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(messages.filter((msg: Message) => msg.id !== messageId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Message",
      "Date",
      "Read Status",
    ];
    const csvContent = [
      headers.join(","),
      ...messages.map((message) =>
        [
          `"${message.name?.replace(/"/g, '""') || ""}"`,
          `"${message.email?.replace(/"/g, '""') || ""}"`,
          `"${message.phone ? message.phone.replace(/"/g, '""') : ""}"`,
          `"${message.message?.replace(/"/g, '""') || ""}"`,
          `"${format(new Date(message.created_at), "yyyy-MM-dd HH:mm:ss")}"`,
          `"${message.is_read ? "Read" : "Unread"}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `messages-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage contact form messages</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleExport}
        >
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
                    <Badge
                      variant={message.is_read ? "outline" : "secondary"}
                      className="ml-2"
                    >
                      {message.is_read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {message.email}
                  </p>
                  {message.phone && (
                    <p className="text-sm text-muted-foreground">
                      {message.phone}
                    </p>
                  )}
                  <div className="mt-4">
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(message.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() =>
                        handleToggleRead(message.id, message.is_read)
                      }
                    >
                      <Eye className="h-4 w-4" />
                      Mark as {message.is_read ? "Unread" : "Read"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(message.id)}
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
  );
}
