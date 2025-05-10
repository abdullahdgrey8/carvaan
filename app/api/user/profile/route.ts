import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for user profile fetch")

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      console.log("User not found:", userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Return user profile (excluding password hash)
    const userProfile = {
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      memberSince: user.memberSince,
    }

    console.log("User profile fetched successfully:", userId)
    return NextResponse.json({ success: true, user: userProfile })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching user profile" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, fullName, phoneNumber } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for user profile update")

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(userId, { fullName, phoneNumber }, { new: true })

    if (!updatedUser) {
      console.log("User not found for update:", userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    console.log("User profile updated successfully:", userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while updating user profile" },
      { status: 500 },
    )
  }
}
