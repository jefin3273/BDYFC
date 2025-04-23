import type React from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { supabaseServer } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = supabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  const { data: roleData } = await supabase
    .from("user_role_assignments")
    .select("user_roles(name)")
    .eq("user_id", session.user.id)
    .single();

  // Fix the TypeScript error by properly accessing the nested object
  const userRole = roleData?.user_roles?.[0]?.name || null;

  if (!userRole || !["admin", "moderator", "editor"].includes(userRole)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userRole={userRole} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
