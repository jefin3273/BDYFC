'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import PageHeader from "@/components/page-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  description: string
  image_url: string
  category: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  // Load categories dynamically from API
  useEffect(() => {
    async function fetchFolders() {
      const res = await fetch("/api/folders")
      const data = await res.json()
      if (res.ok && data.folders?.length > 0) {
        setCategories(data.folders)
        setSelectedCategory(data.folders[0]) // set default
      }
    }
    fetchFolders()
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    setImages([])
    setNextCursor(null)
    loadImages(selectedCategory, null, true)
  }, [selectedCategory])

  async function loadImages(category: string, cursor: string | null, replace = false) {
    try {
      setLoading(true)
      const res = await fetch(`/api/gallery/${category}${cursor ? `?cursor=${cursor}` : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error("Failed to load")
      setImages(prev => replace ? data.images : [...prev, ...data.images])
      setNextCursor(data.nextCursor || null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleLoadMore() {
    if (!nextCursor) return
    loadImages(selectedCategory, nextCursor)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Gallery"
        subtitle="Explore moments from our events and activities"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <Tabs defaultValue={selectedCategory} className="mb-8">
            <TabsList className="flex flex-wrap justify-center">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading && images.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <motion.div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" layout>
                <AnimatePresence>
                  {images.map((image) => (
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
                          src={image.image_url}
                          alt={image.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {nextCursor && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
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
                src={selectedImage.image_url}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
