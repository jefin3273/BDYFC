import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Pencil, Trash } from "lucide-react"
import { supabaseServer } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

async function getGalleryImages() {
  const supabase = supabaseServer()

  const { data, error } = await supabase.from("gallery_images").select("*").order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching gallery images:", error)
    return []
  }

  return data || []
}

export default async function AdminGalleryPage() {
  const galleryImages = await getGalleryImages()

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground">Manage your gallery images</p>
        </div>
        <Link href="/admin/gallery/new">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={image.image_url || "/placeholder.svg?height=300&width=300"}
                alt={image.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity hover:opacity-100">
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Link href={`/admin/gallery/${image.id}`}>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                  <Button size="icon" variant="destructive" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold">{image.title}</h3>
                <Badge variant="outline">{image.category}</Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{image.description}</p>
            </CardContent>
          </Card>
        ))}

        {galleryImages.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <p className="mb-4 text-muted-foreground">No gallery images found. Add your first image to get started.</p>
            <Link href="/admin/gallery/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
