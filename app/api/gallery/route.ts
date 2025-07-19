import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const galleryDir = path.join(process.cwd(), 'public', 'website_images')
    const categories = fs.readdirSync(galleryDir, { withFileTypes: true }).filter(dir => dir.isDirectory())

    const images: {
      id: number
      title: string
      description: string
      image_url: string
      category: string
    }[] = []

    let idCounter = 1

    for (const category of categories) {
      const categoryName = category.name
      const categoryPath = path.join(galleryDir, categoryName)
      const files = fs.readdirSync(categoryPath).filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))

      for (const file of files) {
        images.push({
          id: idCounter++,
          title: path.parse(file).name,
          description: "",
          category: categoryName,
          image_url: `/website_images/${categoryName}/${file}`, // public path
        })
      }
    }

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error reading local gallery:", error)
    return NextResponse.json({ error: "Failed to load local gallery" }, { status: 500 })
  }
}
