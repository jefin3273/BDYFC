import type React from "react";
import { redirect } from "next/navigation";
import ChurchSidebar from "@/components/church/church-sidebar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error in church layout:", sessionError);
      redirect("/auth/login");
    }

    if (!session) {
      redirect("/auth/login");
    }

    // Check if user has church role
    const { data: roleData, error: roleError } = await supabase
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

    if (roleError) {
      console.error("Error fetching role:", roleError);
      redirect("/");
    }

    const userRole = roleData.user_roles.name;

    if (!userRole || userRole !== "church") {
      redirect("/");
    }

    // Get church details
    const { data: churchData, error: churchError } = await supabase
      .from("churches")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (churchError || !churchData) {
      console.error("Error fetching church details:", churchError);
      redirect("/");
    }

    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <ChurchSidebar churchName={churchData.name} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  } catch (error) {
    console.error("Error in church layout:", error);
    redirect("/");
  }
}
