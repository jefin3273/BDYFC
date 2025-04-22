"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadToCloudinary } from "@/lib/cloudinary"

interface ImageUploadProps {
  onUploadComplete: (imageData: { url: string; publicId: string }) => void
  className?: string
  defaultImage?: string
}

export default function ImageUpload({ onUploadComplete, className = "", defaultImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // Upload to Cloudinary
      const imageData = await uploadToCloudinary(file)
      onUploadComplete(imageData)
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-lg">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition-colors hover:bg-black"
            disabled={isUploading}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex h-32 w-full flex-col items-center justify-center gap-2 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span>Click to upload image</span>
              <span className="text-xs text-muted-foreground">PNG, JPG or WEBP (max 5MB)</span>
            </>
          )}
        </Button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
