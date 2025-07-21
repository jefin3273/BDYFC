import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  try {
    const result = await cloudinary.api.root_folders();
    const folders = result.folders.map((folder: any) => folder.name);
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error fetching folders from Cloudinary:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}
