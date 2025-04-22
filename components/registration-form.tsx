"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface RegistrationFormProps {
  eventId: number
  eventTitle: string
  eventDate: Date
}

export default function RegistrationForm({ eventId, eventTitle, eventDate }: RegistrationFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [registrationType, setRegistrationType] = useState<string>("1") // 1 for Individual, 2 for Church
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    churchName: "",
    churchAddress: "",
    numberOfAttendees: 1,
    notes: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for this event",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/events/${eventId}`)
      return
    }

    try {
      const { error } = await supabaseBrowser.from("registrations").insert([
        {
          event_id: eventId,
          registration_type_id: Number.parseInt(registrationType),
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          church_name: registrationType === "2" ? formData.churchName : null,
          church_address: registrationType === "2" ? formData.churchAddress : null,
          number_of_attendees: registrationType === "2" ? formData.numberOfAttendees : 1,
          notes: formData.notes,
        },
      ])

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Registration successful!",
        description: "You have successfully registered for this event.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error submitting registration:", err)
      setError(err.message || "There was an error submitting your registration. Please try again.")
      toast({
        title: "Registration failed",
        description: err.message || "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardHeader className="bg-red-600 text-white">
        <CardTitle className="text-xl">Register for {eventTitle}</CardTitle>
        <CardDescription className="text-red-100">
          Event Date: {eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success ? (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Registration successful! You have been registered for {eventTitle}. We look forward to seeing you at the
              event.
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="church" />
                  <Label htmlFor="church" className="cursor-pointer">
                    Church Group Registration
                  </Label>
                </div>
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

            {registrationType === "2" && (
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

                <div className="space-y-2">
                  <Label htmlFor="numberOfAttendees">Number of Attendees</Label>
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

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Register Now"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t bg-slate-50 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          By registering, you agree to our terms and conditions for event participation.
        </p>
      </CardFooter>
    </Card>
  )
}
