import type React from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Get session using the enhanced server client that properly handles cookies
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error in admin layout:", sessionError);
      redirect("/auth/login");
    }

    if (!session) {
      redirect("/auth/login");
    }

    // Get the user's role directly with a join query for efficiency
    const { data: userData, error: roleError } = await supabase
      .from("user_role_assignments")
      .select(
        `
        user_roles!inner (
          name
        )
      `
      )
      .eq("user_id", session.user.id)
      .single();

    if (roleError || !userData) {
      console.error("Error fetching role:", roleError);
      redirect("/");
    }

    // Properly access the nested user_roles object
    const userRole = userData.user_roles?.name;

    // Check if user has required role
    if (!userRole || !["admin", "moderator", "editor"].includes(userRole)) {
      redirect("/");
    }

    // Fetch unread messages count
    const { data: messages, error: messagesError } = await supabase
      .from("contact_messages")
      .select("id")
      .eq("is_read", false);

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    const unreadMessagesCount = messages?.length || 0;

    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar
          userRole={userRole}
          unreadMessagesCount={unreadMessagesCount}
        />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  } catch (error) {
    console.error("Error in admin layout:", error);
    redirect("/");
  }
}
