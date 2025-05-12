import { NextResponse } from "next/server"
import { getMostViewedCars } from "@/lib/analytics"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import { getPriceHistoryFromPostgres } from "@/lib/price-history-service"
import { getViewTrendsByDay, getViewsByDeviceType } from "@/lib/view-analytics-service"
import { getPopularSearchQueries, getPopularFeatures } from "@/lib/search-analytics-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get("type")
    const make = url.searchParams.get("make")
    const model = url.searchParams.get("model")

    if (type === "popular") {
      try {
        // Get most viewed cars
        const carIds = await getMostViewedCars(5)

        if (carIds.length === 0) {
          // If Redis fails or returns no data, return empty array
          return NextResponse.json({ success: true, cars: [] })
        }

        // Connect to MongoDB to get car details
        await connectToDatabase()

        // Convert string IDs to ObjectIds
        const cars = await CarAd.find({ _id: { $in: carIds } })

        // Format cars for response
        const formattedCars = cars.map((car) => ({
          id: car._id.toString(),
          title: car.title,
          price: car.price,
          location: car.location,
          year: car.year,
          mileage: car.mileage,
          image: car.images && car.images.length > 0 ? car.images[0] : "/placeholder.svg?height=200&width=300",
        }))

        return NextResponse.json({ success: true, cars: formattedCars })
      } catch (error) {
        console.error("Error fetching popular cars:", error)
        return NextResponse.json({ success: true, cars: [] })
      }
    } else if (type === "price-history" && make && model) {
      try {
        // Get price history data from PostgreSQL
        const priceHistory = await getPriceHistoryFromPostgres(make, model)

        // Format the data for the chart
        const formattedHistory = priceHistory.map((entry) => ({
          date: entry.date.toISOString().split("T")[0],
          price: entry.averagePrice,
          minPrice: entry.minPrice,
          maxPrice: entry.maxPrice,
        }))

        return NextResponse.json({ success: true, priceHistory: formattedHistory })
      } catch (error) {
        console.error("Error fetching price history:", error)
        return NextResponse.json({ success: true, priceHistory: [] })
      }
    } else if (type === "view-trends") {
      try {
        // Get view trends by day
        const days = Number.parseInt(url.searchParams.get("days") || "30")
        const trends = await getViewTrendsByDay(days)
        return NextResponse.json({ success: true, trends })
      } catch (error) {
        console.error("Error fetching view trends:", error)
        return NextResponse.json({ success: true, trends: [] })
      }
    } else if (type === "device-distribution") {
      try {
        // Get view distribution by device type
        const distribution = await getViewsByDeviceType()
        return NextResponse.json({ success: true, distribution })
      } catch (error) {
        console.error("Error fetching device distribution:", error)
        return NextResponse.json({ success: true, distribution: [] })
      }
    } else if (type === "popular-searches") {
      try {
        // Get popular search queries
        const limit = Number.parseInt(url.searchParams.get("limit") || "10")
        const queries = await getPopularSearchQueries(limit)
        return NextResponse.json({ success: true, queries })
      } catch (error) {
        console.error("Error fetching popular searches:", error)
        return NextResponse.json({ success: true, queries: [] })
      }
    } else if (type === "popular-features") {
      try {
        // Get popular features
        const limit = Number.parseInt(url.searchParams.get("limit") || "10")
        const features = await getPopularFeatures(limit)
        return NextResponse.json({ success: true, features })
      } catch (error) {
        console.error("Error fetching popular features:", error)
        return NextResponse.json({ success: true, features: [] })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid analytics type" }, { status: 400 })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while fetching analytics" }, { status: 500 })
  }
}
