import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ connected: true })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json({ connected: false })
  }
}
