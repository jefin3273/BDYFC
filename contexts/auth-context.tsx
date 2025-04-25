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
  refreshSession: () => Promise<
    { user: User | null; session: Session | null } | { error: any }
  >;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authError, setAuthError] = useState<any>(null);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const { data, error } = await supabaseBrowser.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      return data;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return { error };
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch user role
      const { data: roleData, error: roleError } = await supabaseBrowser
        .from("user_role_assignments")
        .select("role_id")
        .eq("user_id", userId)
        .single();

      if (roleError) throw roleError;

      if (roleData) {
        const { data: role, error: roleNameError } = await supabaseBrowser
          .from("user_roles")
          .select("name")
          .eq("id", roleData.role_id)
          .single();

        if (roleNameError) throw roleNameError;
        setUserRole(role?.name || null);
        return role?.name;
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      setUserRole(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
          error,
        } = await supabaseBrowser.auth.getSession();

        if (error) {
          setAuthError(error);
          console.error("Session error in AuthContext:", error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (err) {
        console.error("Error in auth initialization:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }

        setIsLoading(false);

        if (event === "SIGNED_IN") {
          router.refresh();
        } else if (event === "SIGNED_OUT") {
          router.refresh();
          router.push("/");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);

        if (data.session.user) {
          await fetchUserRole(data.session.user.id);
        }

        router.refresh();
      }

      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { data, error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabaseBrowser.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
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
    refreshSession,
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
