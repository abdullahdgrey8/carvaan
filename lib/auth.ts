"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "./mongodb"
import User from "@/models/User"
import mongoose from "mongoose"
import { createSession, deleteSession, getCurrentSession } from "./session"

// Signup function
export async function signup(formData: {
  fullName: string
  email: string
  password: string
  phoneNumber: string
}) {
  try {
    console.log("Signup attempt for:", formData.email)
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email: formData.email })
    if (existingUser) {
      console.log("Signup failed: Email already in use")
      return { success: false, error: "Email already in use" }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(formData.password, salt)

    // Create new user
    const newUser = new User({
      fullName: formData.fullName,
      email: formData.email,
      passwordHash,
      phoneNumber: formData.phoneNumber,
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    })

    await newUser.save()
    console.log("User created successfully:", newUser._id)

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "An error occurred during signup" }
  }
}

// Login function
export async function login(formData: { email: string; password: string }) {
  try {
    console.log("Login attempt for:", formData.email)
    await connectToDatabase()

    // Find user
    const user = await User.findOne({ email: formData.email })
    if (!user) {
      console.log("Login failed: User not found")
      return { success: false, error: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(formData.password, user.passwordHash)
    if (!isPasswordValid) {
      console.log("Login failed: Invalid password")
      return { success: false, error: "Invalid email or password" }
    }

    // Create session in Redis
    const sessionId = await createSession({
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
    })

    // Set session cookie
    const cookieStore = cookies()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    await cookieStore.set({
      name: "sessionId",
      value: sessionId,
      httpOnly: true,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // Store user ID in another cookie for client-side access
    await cookieStore.set({
      name: "userId",
      value: user._id.toString(),
      httpOnly: false,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // Store user name in another cookie for client-side access
    await cookieStore.set({
      name: "userName",
      value: user.fullName,
      httpOnly: false,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    console.log("Login successful for user:", user._id)

    // Return serializable data
    return {
      success: true,
      user: {
        userId: user._id.toString(),
        fullName: user.fullName,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

// Logout function
export async function logout() {
  try {
    console.log("Logout attempt")

    // Get session ID from cookies
    const cookieStore = cookies()
    const sessionId = cookieStore.get("sessionId")?.value

    // Delete session from Redis if it exists
    if (sessionId) {
      await deleteSession(sessionId)
    }

    // Delete cookies
    await cookieStore.set({
      name: "sessionId",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    await cookieStore.set({
      name: "userId",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    await cookieStore.set({
      name: "userName",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    console.log("Logout successful")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "An error occurred during logout" }
  }
}

// Get user session
export async function getUserSession() {
  try {
    const session = await getCurrentSession()
    if (!session) {
      return null
    }

    return { userId: session.userId }
  } catch (error) {
    console.error("Get user session error:", error)
    return null
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    console.log("Getting user profile for:", userId)
    await connectToDatabase()

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    console.log("User profile retrieved successfully")
    // Return user profile (excluding password hash)
    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      memberSince: user.memberSince,
    }
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  formData: {
    fullName: string
    phoneNumber: string
  },
) {
  try {
    console.log("Updating profile for user:", userId)
    await connectToDatabase()

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, error: "Invalid user ID" }
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      },
      { new: true },
    )

    if (!updatedUser) {
      console.log("Update failed: User not found")
      return { success: false, error: "User not found" }
    }

    console.log("User profile updated successfully")
    return { success: true }
  } catch (error) {
    console.error("Update user profile error:", error)
    return { success: false, error: "An error occurred while updating profile" }
  }
}

// Middleware to protect routes
export async function requireAuth() {
  const session = await getUserSession()
  if (!session) {
    redirect("/login")
  }
  return session
}
