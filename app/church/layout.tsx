import type React from "react";
import { redirect } from "next/navigation";
import ChurchSidebar from "@/components/church/church-sidebar";
import { supabaseServer } from "@/lib/supabase";

export default async function ChurchLayout({
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

  // Check if user has church role
  const { data: roleData, error: roleError } = await supabase
    .from("user_role_assignments")
    .select("role_id")
    .eq("user_id", session.user.id)
    .single();

  if (roleError) {
    console.error("Error fetching role:", roleError);
    redirect("/");
  }

  // Get the role name
  const { data: role, error: roleNameError } = await supabase
    .from("user_roles")
    .select("name")
    .eq("id", roleData.role_id)
    .single();

  if (roleNameError) {
    console.error("Error fetching role name:", roleNameError);
    redirect("/");
  }

  const userRole = role?.name;

  if (!userRole || userRole !== "church") {
    redirect("/");
  }

  // Get church details
  const { data: churchData } = await supabase
    .from("churches")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!churchData) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <ChurchSidebar churchName={churchData.name} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
