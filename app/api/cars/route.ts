import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { userId, ...carData } = formData

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ad creation")

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      console.log("User not found for car ad creation:", userId)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Create new car ad
    const newCarAd = new CarAd({
      userId,
      ...carData,
      views: 0,
      status: "active",
    })

    await newCarAd.save()
    console.log("Car ad created successfully:", newCarAd._id)

    return NextResponse.json({ success: true, adId: newCarAd._id.toString() })
  } catch (error) {
    console.error("Create car ad error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while creating car ad" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const featured = url.searchParams.get("featured") === "true"
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ads fetch")

    const query: any = { status: "active" }

    // If userId is provided, filter by user
    if (userId) {
      query.userId = userId
    }

    // Get car ads
    const carAds = await CarAd.find(query)
      .sort({ createdAt: -1 })
      .limit(featured ? 4 : limit)

    // Format car ads for response
    const formattedAds = carAds.map((ad) => ({
      id: ad._id.toString(),
      title: ad.title,
      price: ad.price,
      location: ad.location,
      year: ad.year,
      mileage: ad.mileage,
      image: ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.svg?height=200&width=300",
      featured: featured,
      createdAt: ad.createdAt,
    }))

    console.log(`Fetched ${formattedAds.length} car ads`)
    return NextResponse.json({ success: true, carAds: formattedAds })
  } catch (error) {
    console.error("Get car ads error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while fetching car ads" }, { status: 500 })
  }
}
