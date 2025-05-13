"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { connectToDatabase } from "./mongodb"
import User from "@/models/User"

// Admin users - in a real app, this would be stored in the database
const ADMIN_EMAILS = ["admin@example.com", "f@gmail.com"] // Added your test email

export async function requireAdmin() {
  try {
    // Get user ID from cookies - properly awaited
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      console.log("No userId cookie found, redirecting to login")
      redirect("/login?redirect=/admin")
    }

    // Connect to database
    await connectToDatabase()

    // Get user
    const user = await User.findById(userId)

    if (!user) {
      console.log("User not found in database, redirecting to login")
      redirect("/login?redirect=/admin")
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email)) {
      console.log(`User ${user.email} is not an admin. Allowed admins: ${ADMIN_EMAILS.join(", ")}`)
      redirect("/")
    }

    console.log(`Admin access granted to ${user.email}`)
    return { userId: user._id.toString(), isAdmin: true }
  } catch (error) {
    console.error("Admin auth error:", error)
    redirect("/login?redirect=/admin")
  }
}
