"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface RegistrationFormProps {
  eventId: number;
  eventTitle: string;
  eventDate: Date;
}

interface ChurchMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  user_id: string;
}

export default function RegistrationForm({
  eventId,
  eventTitle,
  eventDate,
}: RegistrationFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrationType, setRegistrationType] = useState<string>("1"); // 1 for Individual, 2 for Church
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    churchName: "",
    churchAddress: "",
    numberOfAttendees: 1,
    notes: "",
  });
  const [churchMembers, setChurchMembers] = useState<ChurchMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isChurchAdmin, setIsChurchAdmin] = useState(false);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user is already registered for this event
      checkRegistration();

      // Fetch user profile data
      fetchUserProfile();

      // Check if user is a church admin
      checkChurchAdmin();
    }
  }, [user, eventId]);

  const checkRegistration = async () => {
    if (!user) return;

    const { data, error } = await supabaseBrowser
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setAlreadyRegistered(true);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabaseBrowser
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setFormData((prev) => ({
        ...prev,
        name: data.name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
      }));
    }
  };

  const checkChurchAdmin = async () => {
    if (!user) return;

    // Check if user has church role
    const { data: roleData } = await supabaseBrowser
      .from("user_role_assignments")
      .select("role_id")
      .eq("user_id", user.id)
      .single();

    if (roleData) {
      const { data: role } = await supabaseBrowser
        .from("user_roles")
        .select("name")
        .eq("id", roleData.role_id)
        .single();

      if (role && role.name === "church") {
        setIsChurchAdmin(true);

        // Get church details
        const { data: churchData } = await supabaseBrowser
          .from("churches")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (churchData) {
          setChurchId(churchData.id);
          setFormData((prev) => ({
            ...prev,
            churchName: churchData.name,
            churchAddress: churchData.address,
          }));

          // Fetch church members
          fetchChurchMembers(churchData.id);
        }
      }
    }
  };

  const fetchChurchMembers = async (churchId: string) => {
    const { data, error } = await supabaseBrowser
      .from("church_members")
      .select("*")
      .eq("church_id", churchId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching church members:", error);
    } else {
      setChurchMembers(data || []);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAllMembers = () => {
    if (selectedMembers.length === churchMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(churchMembers.map((member) => member.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for this event",
        variant: "destructive",
      });
      router.push(`/auth/login?redirect=/events/${eventId}`);
      return;
    }

    try {
      if (registrationType === "1") {
        // Individual registration
        const { error } = await supabaseBrowser.from("registrations").insert([
          {
            event_id: eventId,
            registration_type_id: Number.parseInt(registrationType),
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            church_name: null,
            church_address: null,
            number_of_attendees: 1,
            notes: formData.notes,
            payment_status: "pending",
            status: "confirmed",
          },
        ]);

        if (error) throw error;
      } else if (registrationType === "2" && isChurchAdmin) {
        // Church group registration
        const { error: churchError } = await supabaseBrowser
          .from("registrations")
          .insert([
            {
              event_id: eventId,
              registration_type_id: Number.parseInt(registrationType),
              user_id: user.id,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              church_name: formData.churchName,
              church_address: formData.churchAddress,
              number_of_attendees:
                selectedMembers.length > 0
                  ? selectedMembers.length
                  : formData.numberOfAttendees,
              notes: formData.notes,
              payment_status: "pending",
              status: "confirmed",
              church_id: churchId,
            },
          ]);

        if (churchError) throw churchError;

        // Register selected church members
        if (selectedMembers.length > 0) {
          const memberRegistrations = selectedMembers.map((memberId) => {
            const member = churchMembers.find((m) => m.id === memberId);
            return {
              event_id: eventId,
              registration_type_id: 1, // Individual
              user_id: member?.user_id,
              name: member?.name || "",
              email: member?.email || "",
              phone: member?.phone || "",
              church_name: formData.churchName,
              church_id: churchId,
              registered_by_church: true,
              payment_status: "pending",
              status: "confirmed",
            };
          });

          const { error: membersError } = await supabaseBrowser
            .from("registrations")
            .insert(memberRegistrations);
          if (membersError) throw membersError;
        }
      }

      setSuccess(true);
      toast({
        title: "Registration successful!",
        description: "You have successfully registered for this event.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      setError(
        err.message ||
          "There was an error submitting your registration. Please try again."
      );
      toast({
        title: "Registration failed",
        description:
          err.message ||
          "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardHeader className="bg-red-600 text-white">
        <CardTitle className="text-xl">Register for {eventTitle}</CardTitle>
        <CardDescription className="text-red-100">
          Event Date:{" "}
          {eventDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {alreadyRegistered ? (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50 text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are already registered for this event. You can view your
              registrations in your profile.
            </AlertDescription>
          </Alert>
        ) : success ? (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Registration successful! You have been registered for {eventTitle}
              . We look forward to seeing you at the event.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Registration Type</Label>
              <RadioGroup
                value={registrationType}
                onValueChange={setRegistrationType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="individual" />
                  <Label htmlFor="individual" className="cursor-pointer">
                    Individual Registration
                  </Label>
                </div>
                {isChurchAdmin && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="church" />
                    <Label htmlFor="church" className="cursor-pointer">
                      Church Group Registration
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                required
              />
            </div>

            {registrationType === "2" && isChurchAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    name="churchName"
                    value={formData.churchName}
                    onChange={handleChange}
                    placeholder="Name of your church"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="churchAddress">Church Address</Label>
                  <Textarea
                    id="churchAddress"
                    name="churchAddress"
                    value={formData.churchAddress}
                    onChange={handleChange}
                    placeholder="Address of your church"
                    required
                  />
                </div>

                {churchMembers.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Church Members</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllMembers}
                        className="text-xs"
                      >
                        {selectedMembers.length === churchMembers.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                      {churchMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 py-2 border-b last:border-0"
                        >
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() =>
                              handleMemberToggle(member.id)
                            }
                          />
                          <Label
                            htmlFor={`member-${member.id}`}
                            className="cursor-pointer flex-1"
                          >
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.email}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedMembers.length} of{" "}
                      {churchMembers.length} members
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="numberOfAttendees">
                      Number of Attendees
                    </Label>
                    <Input
                      id="numberOfAttendees"
                      name="numberOfAttendees"
                      type="number"
                      min={1}
                      value={formData.numberOfAttendees}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or information"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading || alreadyRegistered}
            >
              {isLoading ? "Submitting..." : "Register Now"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t bg-slate-50 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          By registering, you agree to our terms and conditions for event
          participation.
        </p>
      </CardFooter>
    </Card>
  );
}
