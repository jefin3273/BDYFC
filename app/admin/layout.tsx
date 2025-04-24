import type React from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers"; // For proper server-side cookie handling

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = await supabaseServer(); // Added await here

  // We still need to check for a session as it contains the user ID
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session error:", sessionError);
    redirect("/auth/login");
  }

  if (!session) {
    redirect("/auth/login");
  }

  try {
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

    const userRole = userData.user_roles[0].name; // Adjusted this line based on your query structure

    // Check if user has required role
    if (!userRole || !["admin", "moderator", "editor"].includes(userRole)) {
      redirect("/");
    }

    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar userRole={userRole} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  } catch (error) {
    console.error("Error in admin layout:", error);
    redirect("/");
  }
}
