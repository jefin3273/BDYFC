"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/page-header";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Registration {
  id: number;
  event_id: number;
  name: string;
  email: string;
  created_at: string;
  events: {
    id: number;
    title: string;
    event_date: string;
    location: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/profile");
      return;
    }

    if (user) {
      // Fetch user profile from Supabase
      const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        try {
          // Assuming you have a 'profiles' table with user_id, name, and phone fields
          const { data, error } = await supabaseBrowser
            .from("profiles")
            .select("name, phone")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 is for "no rows returned"
            console.error("Error fetching profile:", error);
            toast({
              title: "Error",
              description: "Failed to load profile information.",
              variant: "destructive",
            });
          }

          // Set profile with data from Supabase if available
          setProfile({
            id: user.id,
            name: data?.name || "",
            email: user.email || "",
            phone: data?.phone || "",
          });
        } catch (error) {
          console.error("Error in profile fetch:", error);
        } finally {
          setIsProfileLoading(false);
        }
      };

      // Fetch user registrations
      const fetchRegistrations = async () => {
        const { data, error } = await supabaseBrowser
          .from("registrations")
          .select(
            `
            *,
            events (id, title, event_date, location)
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching registrations:", error);
          toast({
            title: "Error",
            description: "Failed to load registration information.",
            variant: "destructive",
          });
          return;
        }

        setRegistrations(data || []);
      };

      fetchUserProfile();
      fetchRegistrations();
    }
  }, [user, isLoading, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      // Update user profile in Supabase
      const { error } = await supabaseBrowser.from("profiles").upsert(
        {
          user_id: user.id,
          name: profile.name,
          phone: profile.phone,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(
        err.message ||
          "There was an error updating your profile. Please try again."
      );
      toast({
        title: "Update failed",
        description:
          err.message ||
          "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account and view your registrations"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Profile" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your profile has been updated successfully.
                      </AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile?.name || ""}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profile?.phone || ""}
                        onChange={handleChange}
                        placeholder="Your phone number"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="registrations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Registrations</CardTitle>
                  <CardDescription>
                    View all your event registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations.length > 0 ? (
                    <div className="space-y-4">
                      {registrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="font-medium">
                                {registration.events.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  registration.events.event_date
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {registration.events.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                Registered on:{" "}
                                {new Date(
                                  registration.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        You haven't registered for any events yet.
                      </p>
                      <Button
                        className="mt-4 bg-red-600 hover:bg-red-700"
                        onClick={() => router.push("/events")}
                      >
                        Browse Events
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
