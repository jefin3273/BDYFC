// For app router
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
    try {
        // Fetch just 4 images from any folder
        const result = await cloudinary.search
            .expression('resource_type:image') // all image types
            .sort_by('created_at', 'desc')
            .max_results(6)
            .execute();

        const images = result.resources.map((img) => ({
            id: img.asset_id,
            title: img.filename.replace(/_/g, ' '),
            category: img.folder,
            description: img.context?.custom?.caption || '',
            image_url: img.secure_url.includes('/upload/')
                ? img.secure_url.replace('/upload/', '/upload/w_600,q_auto,f_auto/')
                : img.secure_url,
        }));



        return NextResponse.json(images);
    } catch (err) {
        console.error("Error fetching preview images:", err);
        return NextResponse.json({ error: "Failed to load preview images" }, { status: 500 });
    }
}
