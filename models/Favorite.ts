import mongoose, { Schema, type Document } from "mongoose"

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId | string
  carAdId: mongoose.Types.ObjectId | string
  createdAt: Date
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    carAdId: { type: Schema.Types.ObjectId, ref: "CarAd", required: true },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only favorite a car once
FavoriteSchema.index({ userId: 1, carAdId: 1 }, { unique: true })

export default mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema)
