import { getCurrentSession } from "@/lib/session"
import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  fullName: string
  email: string
  passwordHash: string
  phoneNumber: string
  memberSince: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    memberSince: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
// Get user session

export async function getUserSession() {
  try {
    const session = await getCurrentSession()
    if (!session || typeof session !== "object") {
      console.error("Invalid session data:", session)
      return null
    }

    return { userId: session.userId }
  } catch (error) {
    console.error("Get user session error:", error)
    return null
  }
}
