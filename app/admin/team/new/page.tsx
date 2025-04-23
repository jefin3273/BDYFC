"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabaseBrowser } from "@/lib/supabase";
import ImageUpload from "@/components/image-upload";

export default function AddTeamMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: "",
    display_order: 0,
  });
  const [imageData, setImageData] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabaseBrowser
        .from("team_members")
        .insert({
          name: formData.name,
          position: formData.position,
          bio: formData.bio,
          image_url: imageData?.url || null,
          image_public_id: imageData?.publicId || null,
          social_facebook: formData.social_facebook || null,
          social_instagram: formData.social_instagram || null,
          social_twitter: formData.social_twitter || null,
          social_linkedin: formData.social_linkedin || null,
          display_order: formData.display_order || 0,
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/admin/team");
      router.refresh();
    } catch (err: any) {
      console.error("Error adding team member:", err);
      setError(err.message || "Failed to add team member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl p-6">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} />
        Back to Team Members
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
          <CardDescription>Add a new member to your team</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <ImageUpload onUploadComplete={setImageData} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">
                    Facebook URL (Optional)
                  </Label>
                  <Input
                    id="social_facebook"
                    name="social_facebook"
                    value={formData.social_facebook}
                    onChange={handleChange}
                    placeholder="https://www.facebook.com/DYFCbombayCNI/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_instagram">
                    Instagram URL (Optional)
                  </Label>
                  <Input
                    id="social_instagram"
                    name="social_instagram"
                    value={formData.social_instagram}
                    onChange={handleChange}
                    placeholder="https://www.instagram.com/bdyfc_cni/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_twitter">Twitter URL (Optional)</Label>
                  <Input
                    id="social_twitter"
                    name="social_twitter"
                    value={formData.social_twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_linkedin">
                    LinkedIn URL (Optional)
                  </Label>
                  <Input
                    id="social_linkedin"
                    name="social_linkedin"
                    value={formData.social_linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Team Member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
