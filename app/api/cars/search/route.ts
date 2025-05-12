import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import { trackUserSearch } from "@/lib/analytics"
import { cookies } from "next/headers"
import { logSearch } from "@/lib/search-analytics-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("query")
    const make = url.searchParams.get("make")
    const category = url.searchParams.get("category")
    const minPrice = url.searchParams.get("minPrice")
    const maxPrice = url.searchParams.get("maxPrice")
    const minYear = url.searchParams.get("minYear")
    const maxYear = url.searchParams.get("maxYear")
    const makes = url.searchParams.get("makes")
    const bodyTypes = url.searchParams.get("bodyTypes")
    const fuelTypes = url.searchParams.get("fuelTypes")

    // Connect to MongoDB
    await connectToDatabase()
    console.log("Connected to MongoDB for car ads search")

    // Build query
    const mongoQuery: any = { status: "active" }

    // Filter by query
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { make: { $regex: query, $options: "i" } },
        { model: { $regex: query, $options: "i" } },
      ]
    }

    // Filter by make
    if (make && make !== "all") {
      mongoQuery.make = make
    }

    // Filter by category/body type
    if (category) {
      mongoQuery.bodyType = category
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      mongoQuery.price = {}
      if (minPrice) mongoQuery.price.$gte = Number(minPrice)
      if (maxPrice) mongoQuery.price.$lte = Number(maxPrice)
    }

    // Filter by year range
    if (minYear || maxYear) {
      mongoQuery.year = {}
      if (minYear) mongoQuery.year.$gte = Number(minYear)
      if (maxYear) mongoQuery.year.$lte = Number(maxYear)
    }

    // Filter by makes (comma-separated list)
    if (makes) {
      const makesList = makes.split(",")
      mongoQuery.make = { $in: makesList }
    }

    // Filter by body types (comma-separated list)
    if (bodyTypes) {
      const bodyTypesList = bodyTypes.split(",")
      mongoQuery.bodyType = { $in: bodyTypesList }
    }

    // Filter by fuel types (comma-separated list)
    if (fuelTypes) {
      const fuelTypesList = fuelTypes.split(",")
      mongoQuery.fuelType = { $in: fuelTypesList }
    }

    // Get car ads
    const carAds = await CarAd.find(mongoQuery).sort({ createdAt: -1 })

    // Format car ads for response
    const formattedAds = carAds.map((ad) => ({
      id: ad._id.toString(),
      title: ad.title,
      price: ad.price,
      location: ad.location,
      year: ad.year,
      mileage: ad.mileage,
      image: ad.images && ad.images.length > 0 ? ad.images[0] : "/placeholder.svg?height=200&width=300",
      featured: false,
      createdAt: ad.createdAt,
    }))

    // Track search if query exists
    if (query || make || category || minPrice || maxPrice || minYear || maxYear || makes || bodyTypes || fuelTypes) {
      // Get user ID from cookies
      const cookieStore = cookies()
      const userId = cookieStore.get("userId")?.value

      // Collect filters for analytics
      const filters = {
        make,
        category,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        makes,
        bodyTypes,
        fuelTypes,
      }

      // Track search in Redis
      if (userId && query) {
        trackUserSearch(userId, query).catch((error) => {
          console.error("Error tracking search in Redis:", error)
        })
      }

      // Log search in PostgreSQL
      logSearch(query || "", userId || null, filters, formattedAds.length).catch((error) => {
        console.error("Error logging search in PostgreSQL:", error)
      })
    }

    console.log(`Search returned ${formattedAds.length} car ads`)
    return NextResponse.json({ success: true, carAds: formattedAds })
  } catch (error) {
    console.error("Search car ads error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while searching car ads" }, { status: 500 })
  }
}
