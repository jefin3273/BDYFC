"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseBrowser } from "@/lib/supabase"
import ImageUpload from "@/components/image-upload"

export default function AddGalleryImagePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    display_order: 0,
  })
  const [imageData, setImageData] = useState<{ url: string; publicId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!imageData) {
      setError("Please upload an image")
      setIsLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabaseBrowser.from("gallery_images").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: imageData.url,
        image_public_id: imageData.publicId,
        display_order: formData.display_order || 0,
      })

      if (insertError) {
        throw insertError
      }

      router.push("/admin/gallery")
      router.refresh()
    } catch (err: any) {
      console.error("Error adding gallery image:", err)
      setError(err.message || "Failed to add gallery image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl p-6">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back to Gallery
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Gallery Image</CardTitle>
          <CardDescription>Add a new image to your gallery</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload onUploadComplete={setImageData} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
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
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Gallery Image"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
