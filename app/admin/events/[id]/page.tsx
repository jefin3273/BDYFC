"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseBrowser } from "@/lib/supabase"
import ImageUpload from "@/components/image-upload"

interface Event {
  id: number
  title: string
  slug: string
  description: string
  location: string
  event_date: string
  end_date: string | null
  is_online: boolean
  color: string
  image_url: string | null
  image_public_id: string | null
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    event_date: "",
    end_date: "",
    is_online: false,
    color: "bg-red-500",
  })
  const [imageData, setImageData] = useState<{ url: string; publicId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      setIsFetching(true)
      const { data, error } = await supabaseBrowser.from("events").select("*").eq("id", params.id).single()

      if (error) {
        console.error("Error fetching event:", error)
        setError("Failed to load event data")
      } else if (data) {
        setEvent(data)
        setFormData({
          title: data.title,
          slug: data.slug,
          description: data.description,
          location: data.location,
          event_date: data.event_date ? new Date(data.event_date).toISOString().slice(0, 16) : "",
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
          is_online: data.is_online,
          color: data.color,
        })
        if (data.image_url && data.image_public_id) {
          setImageData({
            url: data.image_url,
            publicId: data.image_public_id,
          })
        }
      }
      setIsFetching(false)
    }

    fetchEvent()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_online: checked }))
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabaseBrowser
        .from("events")
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          location: formData.location,
          event_date: formData.event_date,
          end_date: formData.end_date || null,
          is_online: formData.is_online,
          color: formData.color,
          image_url: imageData?.url || null,
          image_public_id: imageData?.publicId || null,
        })
        .eq("id", params.id)

      if (updateError) {
        throw updateError
      }

      router.push("/admin/events")
      router.refresh()
    } catch (err: any) {
      console.error("Error updating event:", err)
      setError(err.message || "Failed to update event. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl p-6">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back to Events
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update event information</CardDescription>
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
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex gap-2">
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_online" checked={formData.is_online} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_online">Online Event</Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Image</Label>
                  <ImageUpload onUploadComplete={setImageData} defaultImage={event?.image_url || undefined} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date & Time</Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date & Time (Optional)</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color Theme</Label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="bg-red-500">Red</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-indigo-500">Indigo</option>
                  </select>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Updating Event..." : "Update Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
