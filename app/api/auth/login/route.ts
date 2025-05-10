import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for user login")

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      console.log("Login failed: Invalid email")
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      console.log("Login failed: Invalid password")
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 })
    }

    // Create session
    const sessionId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const session = {
      sessionId,
      userId: user._id.toString(),
      expiresAt: expiresAt.toISOString(),
    }

    console.log("User logged in successfully:", user._id)

    return NextResponse.json({
      success: true,
      session,
      user: {
        userId: user._id.toString(),
        fullName: user.fullName,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during login" }, { status: 500 })
  }
}
