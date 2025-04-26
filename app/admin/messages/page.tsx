import { supabaseServer } from "@/lib/supabase";
import AdminMessagesPage from "@/components/admin/admin-messages-page";

export default async function AdminMessagesServerPage() {
  const supabase = supabaseServer();

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    return (
      <div className="p-6">Error loading messages. Please try again later.</div>
    );
  }

  return <AdminMessagesPage messages={messages || []} />;
}
