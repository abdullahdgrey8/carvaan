import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { fullName, email, password, phoneNumber } = await request.json()

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for user signup")

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("Signup failed: Email already in use")
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create new user
    const memberSince = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    const newUser = new User({
      fullName,
      email,
      passwordHash,
      phoneNumber,
      memberSince,
    })

    await newUser.save()
    console.log("User created successfully:", newUser._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during signup" }, { status: 500 })
  }
}
