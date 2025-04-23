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
  const { data: roleData } = await supabase
    .from("user_role_assignments")
    .select("user_roles(name)")
    .eq("user_id", session.user.id)
    .single();

  const userRole = roleData?.user_roles?.[0]?.name;

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
    <div className="flex min-h-screen">
      <ChurchSidebar churchName={churchData.name} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
