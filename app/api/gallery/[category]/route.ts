// /app/api/gallery/[category]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

const IMAGES_PER_PAGE = 9

export async function GET(req: NextRequest, { params }: { params: { category: string } }) {
    try {
        const category = params.category
        const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined

        const result = await cloudinary.search
            .expression(`folder:"${category}/*"`)
            .sort_by('created_at', 'desc')
            .max_results(IMAGES_PER_PAGE)
            .next_cursor(cursor) // Use Cloudinary's pagination cursor
            .execute()

        const images = result.resources.map((img: any) => ({
            id: img.asset_id,
            title: img.filename.replace(/_/g, ' '),
            description: img.context?.custom?.caption || '',
            image_url: img.secure_url.replace('/upload/', '/upload/w_600,q_auto,f_auto/'), // optimized
            category,
        }))

        return NextResponse.json({
            images,
            nextCursor: result.next_cursor || null,
        })
    } catch (err) {
        console.error("Cloudinary fetch error:", err)
        return NextResponse.json({ error: 'Failed to fetch from Cloudinary' }, { status: 500 })
    }
}
