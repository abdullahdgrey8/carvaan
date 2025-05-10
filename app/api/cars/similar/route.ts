import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const carId = url.searchParams.get("carId")

    if (!carId) {
      return NextResponse.json({ success: false, error: "Car ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for similar car ads fetch")

    // Find the current car
    const currentCar = await CarAd.findById(carId)
    if (!currentCar) {
      console.log("Car ad not found:", carId)
      return NextResponse.json({ success: false, error: "Car ad not found" }, { status: 404 })
    }

    // Find similar cars based on make, model, or price range
    const similarCars = await CarAd.find({
      _id: { $ne: new mongoose.Types.ObjectId(carId) },
      status: "active",
      $or: [
        { make: currentCar.make },
        {
          $and: [{ price: { $gte: currentCar.price * 0.8 } }, { price: { $lte: currentCar.price * 1.2 } }],
        },
        { bodyType: currentCar.bodyType },
      ],
    })
      .limit(3)
      .sort({ createdAt: -1 })

    // Format similar cars for response
    const formattedSimilarCars = similarCars.map((car) => ({
      id: car._id.toString(),
      title: car.title,
      price: car.price,
      location: car.location,
      image: car.images[0] || "/placeholder.svg?height=150&width=250",
    }))

    console.log(`Found ${formattedSimilarCars.length} similar car ads`)
    return NextResponse.json({ success: true, similarCars: formattedSimilarCars })
  } catch (error) {
    console.error("Get similar car ads error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while fetching similar car ads" },
      { status: 500 },
    )
  }
}
