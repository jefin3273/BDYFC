"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseBrowser } from "@/lib/supabase"

export default function AddChurchMemberPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [churchId, setChurchId] = useState<number | null>(null)

  useEffect(() => {
    const fetchChurchId = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession()
      if (!sessionData.session) return

      const { data: churchData } = await supabaseBrowser
        .from("churches")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single()

      if (churchData) {
        setChurchId(churchData.id)
      }
    }

    fetchChurchId()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!churchId) {
      setError("Church information not found. Please try again.")
      setIsLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabaseBrowser.from("church_members").insert({
        church_id: churchId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      })

      if (insertError) {
        throw insertError
      }

      router.push("/church/members")
    } catch (err: any) {
      console.error("Error adding member:", err)
      setError(err.message || "Failed to add member. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back to Members
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
          <CardDescription>Add a new member to your church</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Member..." : "Add Member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
