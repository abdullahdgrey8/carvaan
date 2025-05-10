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
