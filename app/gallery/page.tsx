"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { supabaseBrowser } from "@/lib/supabase"
import PageHeader from "@/components/page-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface GalleryImage {
  id: number
  title: string
  description: string
  image_url: string
  category: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImages() {
      setLoading(true)
      const { data, error } = await supabaseBrowser
        .from("gallery_images")
        .select("*")
        .order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching gallery images:", error)
        setLoading(false)
        return
      }

      setImages(data || [])

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data?.map((img) => img.category) || []))
      setCategories(uniqueCategories)

      setLoading(false)
    }

    fetchImages()
  }, [])

  const filteredImages = selectedCategory === "all" ? images : images.filter((img) => img.category === selectedCategory)

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Gallery"
        subtitle="Explore moments from our events and activities"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="flex flex-wrap justify-center">
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>
                All
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
          ) : (
            <motion.div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" layout>
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={image.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <h3 className="text-lg font-bold">{image.title}</h3>
                        <p className="mt-1 text-sm">{image.category}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </button>
            <div className="relative max-h-[80vh] max-w-4xl overflow-hidden rounded-lg">
              <Image
                src={selectedImage.image_url || "/placeholder.svg?height=800&width=1200"}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                <h3 className="text-xl font-bold text-white">{selectedImage.title}</h3>
                <p className="mt-1 text-sm text-white/80">{selectedImage.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
