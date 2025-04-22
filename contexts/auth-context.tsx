"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  userRole: string | null;
  signInWithGoogle: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabaseBrowser.auth.getSession();
      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user role
        const { data: roleData } = await supabaseBrowser
          .from("user_role_assignments")
          .select("user_roles(name)")
          .eq("user_id", session.user.id)
          .single();

        setUserRole(roleData?.user_roles?.name || null);
      }

      setIsLoading(false);
    };

    setData();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role
          const { data: roleData } = await supabaseBrowser
            .from("user_role_assignments")
            .select("user_roles(name)")
            .eq("user_id", session.user.id)
            .single();

          setUserRole(roleData?.user_roles?.name || null);
        } else {
          setUserRole(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.refresh();
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    userRole,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
