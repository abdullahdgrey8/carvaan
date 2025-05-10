import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import User from "@/models/User"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ad fetch")

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      console.log("Car ad not found:", id)
      return NextResponse.json({ success: false, error: "Car ad not found" }, { status: 404 })
    }

    // Increment views
    carAd.views += 1
    await carAd.save()

    // Get seller info
    const user = await User.findById(carAd.userId)
    const seller = user
      ? {
          name: user.fullName,
          phone: user.phoneNumber,
          email: user.email,
          rating: 4.8, // Default rating for now
          memberSince: user.memberSince,
        }
      : {
          name: "Unknown Seller",
          phone: "N/A",
          email: "N/A",
          rating: 0,
          memberSince: "N/A",
        }

    // Format car ad for response
    const formattedAd = {
      id: carAd._id.toString(),
      userId: carAd.userId.toString(),
      title: carAd.title,
      make: carAd.make,
      model: carAd.model,
      year: carAd.year,
      price: carAd.price,
      mileage: carAd.mileage,
      description: carAd.description,
      bodyType: carAd.bodyType,
      fuelType: carAd.fuelType,
      transmission: carAd.transmission,
      features: carAd.features,
      location: carAd.location,
      images: carAd.images,
      status: carAd.status,
      views: carAd.views,
      createdAt: carAd.createdAt.toISOString(),
      updatedAt: carAd.updatedAt.toISOString(),
      seller,
      coordinates: {
        lat: 47.6062, // Default coordinates for now
        lng: -122.3321,
      },
      specifications: {
        engine: "Not specified",
        transmission: carAd.transmission,
        drivetrain: "Not specified",
        fuelEconomy: "Not specified",
        exteriorColor: "Not specified",
        interiorColor: "Not specified",
        vin: "Not specified",
        doors: "4",
        condition: "Good",
      },
    }

    console.log("Car ad fetched successfully:", id)
    return NextResponse.json({ success: true, carAd: formattedAd })
  } catch (error) {
    console.error("Get car ad error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while fetching car ad" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { userId, ...updateData } = await request.json()

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ad update")

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      console.log("Car ad not found for update:", id)
      return NextResponse.json({ success: false, error: "Car ad not found" }, { status: 404 })
    }

    // Check if user owns the ad
    if (carAd.userId.toString() !== userId) {
      console.log("User does not own the car ad:", userId, carAd.userId)
      return NextResponse.json(
        { success: false, error: "You do not have permission to update this ad" },
        { status: 403 },
      )
    }

    // Update car ad
    const updatedCarAd = await CarAd.findByIdAndUpdate(id, updateData, { new: true })

    console.log("Car ad updated successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update car ad error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while updating car ad" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ad deletion")

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      console.log("Car ad not found for deletion:", id)
      return NextResponse.json({ success: false, error: "Car ad not found" }, { status: 404 })
    }

    // Check if user owns the ad
    if (carAd.userId.toString() !== userId) {
      console.log("User does not own the car ad:", userId, carAd.userId)
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete this ad" },
        { status: 403 },
      )
    }

    // Delete car ad
    await CarAd.findByIdAndDelete(id)

    console.log("Car ad deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete car ad error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while deleting car ad" }, { status: 500 })
  }
}
