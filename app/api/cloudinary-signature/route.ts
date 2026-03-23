import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// This route generates a signature so the browser can upload
// directly to Cloudinary (bypassing Vercel's 4.5MB limit)
export async function POST() {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "gallery";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error: any) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
