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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  church_id?: string;
  church_membership_status?: string;
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

interface Church {
  id: string;
  name: string;
  address: string;
  contact_person: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, userRole } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [churchDetails, setChurchDetails] = useState<Church | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/profile");
      return;
    }

    if (user) {
      fetchUserProfile();
      fetchRegistrations();
      fetchChurches();
      fetchUserRole(); // New function to fetch user role
    }
  }, [user, isLoading, router]);

  // New function to fetch user role from database
  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("user_role_assignments")
        .select(
          `
          user_roles (
            name
          )
        `
        )
        .eq("user_id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }

      if (data && data.user_roles && Array.isArray(data.user_roles)) {
        setRole(data.user_roles[0]?.name || null);
      } else if (data && data.user_roles) {
        // For when user_roles is returned as an object, not an array
        setRole(data.user_roles.name || null);
      }
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
    }
  };

  const fetchUserProfile = async () => {
    const { data, error } = await supabaseBrowser
      .from("user_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data);

      // If user has a church, fetch church details
      if (data.church_id) {
        const { data: churchData } = await supabaseBrowser
          .from("churches")
          .select("*")
          .eq("id", data.church_id)
          .single();

        if (churchData) {
          setChurchDetails(churchData);
        }
      }
    } else {
      // Create a new profile if it doesn't exist
      setProfile({
        id: "",
        name: user?.user_metadata?.name || "",
        email: user?.email || "",
        phone: "",
      });
    }
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabaseBrowser
      .from("registrations")
      .select(
        `
        *,
        events (id, title, event_date, location)
      `
      )
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching registrations:", error);
      return;
    }

    setRegistrations(data || []);
  };

  const fetchChurches = async () => {
    const { data, error } = await supabaseBrowser
      .from("churches")
      .select("*")
      .eq("is_approved", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching churches:", error);
      return;
    }

    setChurches(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const profileData = {
        user_id: user?.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      const { data: existingProfile } = await supabaseBrowser
        .from("user_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabaseBrowser
          .from("user_profiles")
          .update(profileData)
          .eq("id", existingProfile.id);

        if (updateError) {
          // Check specifically for duplicate phone errors
          if (
            updateError.code === "23505" &&
            updateError.message.includes("phone")
          ) {
            throw new Error(
              "This phone number is already in use. Please use a different number."
            );
          }
          throw updateError;
        }
      } else {
        // Insert new profile
        const { error: insertError } = await supabaseBrowser
          .from("user_profiles")
          .insert([profileData]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Fetch updated profile data after successful update
      fetchUserProfile();
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

  const handleChurchRequest = async () => {
    if (!selectedChurch || !user) return;

    setIsRequesting(true);
    setError(null);

    try {
      // Check if user already has a pending request
      const { data: existingRequest } = await supabaseBrowser
        .from("church_membership_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .single();

      if (existingRequest) {
        setError("You already have a pending request to join a church.");
        setIsRequesting(false);
        return;
      }

      // Create membership request
      const { error: requestError } = await supabaseBrowser
        .from("church_membership_requests")
        .insert([
          {
            user_id: user.id,
            church_id: selectedChurch,
            status: "pending",
          },
        ]);

      if (requestError) throw requestError;

      // Update user profile with pending status
      const { error: profileError } = await supabaseBrowser
        .from("user_profiles")
        .update({
          church_id: selectedChurch,
          church_membership_status: "pending",
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Request sent",
        description:
          "Your request to join the church has been sent successfully.",
      });

      // Refresh profile data
      fetchUserProfile();
    } catch (err: any) {
      console.error("Error requesting church membership:", err);
      setError(
        err.message ||
          "There was an error sending your request. Please try again."
      );
      toast({
        title: "Request failed",
        description:
          err.message ||
          "There was an error sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  // Check if user role should see church membership section
  const shouldShowChurchMembership = role === "user" || role === null;

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
                    {role && (
                      <span className="block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full w-fit">
                        <span className="capitalize">{role}</span>
                      </span>
                    )}
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

                  {/* Church Membership Section - Only shown for user role */}
                  {shouldShowChurchMembership && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">
                        Church Membership
                      </h3>

                      {profile?.church_membership_status === "approved" &&
                      churchDetails ? (
                        <div className="space-y-2">
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">
                              You are a member of {churchDetails.name}
                            </AlertDescription>
                          </Alert>
                          <div className="text-sm space-y-1 mt-2">
                            <p>
                              <span className="font-medium">Church:</span>{" "}
                              {churchDetails.name}
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{" "}
                              {churchDetails.address}
                            </p>
                            <p>
                              <span className="font-medium">
                                Contact Person:
                              </span>{" "}
                              {churchDetails.contact_person}
                            </p>
                          </div>
                        </div>
                      ) : profile?.church_membership_status === "pending" ? (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-700">
                            Your church membership request is pending approval.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Join a church to participate in church events and
                            activities.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="church">Select Church</Label>
                            <Select
                              value={selectedChurch}
                              onValueChange={setSelectedChurch}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a church" />
                              </SelectTrigger>
                              <SelectContent>
                                {churches.map((church) => (
                                  <SelectItem key={church.id} value={church.id}>
                                    {church.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            className="w-full"
                            onClick={handleChurchRequest}
                            disabled={!selectedChurch || isRequesting}
                          >
                            {isRequesting
                              ? "Sending Request..."
                              : "Request to Join"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show church information for church role users */}
                  {role === "church" && churchDetails && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">
                        Church Details
                      </h3>
                      <div className="space-y-2 bg-blue-50 p-4 rounded-md">
                        <p className="font-medium text-blue-800">
                          {churchDetails.name}
                        </p>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Address:</span>{" "}
                          {churchDetails.address}
                        </p>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Contact Person:</span>{" "}
                          {churchDetails.contact_person}
                        </p>
                      </div>
                    </div>
                  )}
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
