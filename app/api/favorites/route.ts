import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Favorite from "@/models/Favorite"
import CarAd from "@/models/CarAd"

export async function POST(request: Request) {
  try {
    const { userId, carAdId } = await request.json()

    if (!userId || !carAdId) {
      return NextResponse.json({ success: false, error: "User ID and Car Ad ID are required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for favorite creation")

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({ userId, carAdId })
    if (existingFavorite) {
      console.log("Favorite already exists")
      return NextResponse.json({ success: true, exists: true })
    }

    // Create new favorite
    const newFavorite = new Favorite({
      userId,
      carAdId,
    })

    await newFavorite.save()
    console.log("Favorite created successfully:", newFavorite._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create favorite error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while creating favorite" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const carAdId = url.searchParams.get("carAdId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for favorites fetch")

    // If carAdId is provided, check if the user has favorited this car
    if (carAdId) {
      const favorite = await Favorite.findOne({ userId, carAdId })
      return NextResponse.json({ success: true, isFavorite: !!favorite })
    }

    // Otherwise, get all favorites for the user
    const favorites = await Favorite.find({ userId })
    const carAdIds = favorites.map((fav) => fav.carAdId)

    // Get car ads for these favorites
    const carAds = await CarAd.find({ _id: { $in: carAdIds } })

    // Format car ads for response
    const formattedFavorites = carAds.map((ad) => ({
      id: ad._id.toString(),
      title: ad.title,
      price: ad.price,
      location: ad.location,
      year: ad.year,
      mileage: ad.mileage,
      image: ad.images[0] || "/placeholder.svg?height=200&width=300",
      createdAt: ad.createdAt,
    }))

    console.log(`Fetched ${formattedFavorites.length} favorites for user:`, userId)
    return NextResponse.json({ success: true, favorites: formattedFavorites })
  } catch (error) {
    console.error("Get favorites error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while fetching favorites" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const carAdId = url.searchParams.get("carAdId")

    if (!userId || !carAdId) {
      return NextResponse.json({ success: false, error: "User ID and Car Ad ID are required" }, { status: 400 })
    }

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for favorite deletion")

    // Delete favorite
    await Favorite.findOneAndDelete({ userId, carAdId })

    console.log("Favorite deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete favorite error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while deleting favorite" }, { status: 500 })
  }
}
