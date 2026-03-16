import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadResult = await new Promise((resolve, reject) => {

    cloudinary.uploader.upload_stream(
      { folder: "presets" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)

  })

  return NextResponse.json(uploadResult)
}