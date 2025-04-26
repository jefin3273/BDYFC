"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Footer() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: submitError } = await supabaseBrowser
        .from("anonymous_feedback")
        .insert([
          {
            feedback,
          },
        ]);

      if (submitError) {
        throw submitError;
      } else {
        setSuccess(true);
        setFeedback("");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              About BDYFC
            </h3>
            <p className="mb-4 text-sm">
              The Bombay Diocesan Youth Fellowship Committee (BDYFC) is
              dedicated to nurturing the spiritual growth of young people
              through fellowship, worship, and service.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/DYFCbombayCNI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://www.instagram.com/bdyfc_cni/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://www.youtube.com/@BDYFC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 transition-colors hover:text-white"
              >
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/events"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  19, Hazarimal Somani Rd, Azad Maidan, Fort, Mumbai,
                  Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span>+91 97685 55858</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <span>contact@bdyfc.org</span>
              </li>
            </ul>
          </div>

          {/* Anonymous Feedback */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Anonymous Feedback
            </h3>
            <p className="mb-4 text-sm">
              Share your thoughts, suggestions, or concerns anonymously.
            </p>
            {success ? (
              <Alert className="bg-green-900/50 border-green-700 text-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Thank you for your feedback!
                </AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-2" onSubmit={handleSubmit}>
                <Textarea
                  placeholder="Your feedback..."
                  className="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  rows={3}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Bombay Diocesan Youth Fellowship
            Committee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
