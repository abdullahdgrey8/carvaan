import mongoose, { Schema, type Document } from "mongoose"

export interface ICarAd extends Document {
  userId: mongoose.Types.ObjectId | string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  description: string
  bodyType: string
  fuelType: string
  transmission: string
  features: string[]
  location: string
  images: string[]
  status: "pending" | "active" | "inactive"
  views: number
  specifications: {
    engine: string
    transmission: string
    drivetrain: string
    fuelEconomy: string
    exteriorColor: string
    interiorColor: string
    vin: string
    doors: string
    condition: string
    [key: string]: string
  }
  seller: {
    name: string
    phone: string
    email: string
    rating: number
    memberSince: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  createdAt: Date
  updatedAt: Date
}

const CarAdSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    description: { type: String, required: true },
    bodyType: { type: String, required: true },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    features: [{ type: String }],
    location: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "active",
    },
    views: { type: Number, default: 0 },
    specifications: {
      engine: { type: String, default: "Not specified" },
      transmission: { type: String, default: "Not specified" },
      drivetrain: { type: String, default: "Not specified" },
      fuelEconomy: { type: String, default: "Not specified" },
      exteriorColor: { type: String, default: "Not specified" },
      interiorColor: { type: String, default: "Not specified" },
      vin: { type: String, default: "Not specified" },
      doors: { type: String, default: "Not specified" },
      condition: { type: String, default: "Not specified" },
    },
    seller: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      rating: { type: Number, default: 5.0 },
      memberSince: { type: String, required: true },
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
)

export default mongoose.models.CarAd || mongoose.model<ICarAd>("CarAd", CarAdSchema)
