"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { supabaseBrowser } from "@/lib/supabase"
import ImageUpload from "@/components/image-upload"

export default function RegisterChurchPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    churchName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    contactPerson: "",
  })
  const [logoData, setLogoData] = useState<{ url: string; publicId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      // Register the user
      const { data, error: signUpError } = await signUp(formData.email, formData.password)

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Create church profile
        const { error: profileError } = await supabaseBrowser.from("churches").insert({
          user_id: data.user.id,
          name: formData.churchName,
          address: formData.address,
          phone: formData.phone,
          contact_person: formData.contactPerson,
          logo_url: logoData?.url || null,
          logo_public_id: logoData?.publicId || null,
        })

        if (profileError) {
          console.error("Error creating church profile:", profileError)
          setError("Failed to create church profile. Please try again.")
          setIsLoading(false)
          return
        }

        // Assign church role
        const { data: roleData } = await supabaseBrowser.from("user_roles").select("id").eq("name", "church").single()

        if (roleData) {
          await supabaseBrowser.from("user_role_assignments").insert({
            user_id: data.user.id,
            role_id: roleData.id,
          })
        }

        router.push("/auth/login?message=Registration successful! Please check your email to confirm your account.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl px-4"
      >
        <Card className="overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-red-600 text-white">
            <CardTitle className="text-2xl">Church Registration</CardTitle>
            <CardDescription className="text-red-100">Register your church with BDYFC</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input
                    id="churchName"
                    name="churchName"
                    value={formData.churchName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Church Logo (Optional)</Label>
                  <ImageUpload onUploadComplete={setLogoData} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Church"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t bg-slate-50 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
