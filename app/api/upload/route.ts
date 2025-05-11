import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "car-ads",
      resource_type: "image",
    })

    console.log("Image uploaded to Cloudinary:", result.secure_url)

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during upload" }, { status: 500 })
  }
}
