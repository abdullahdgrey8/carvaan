import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const carIds = url.searchParams.get("carIds")

    if (!carIds) {
      return NextResponse.json({ success: false, error: "Car IDs are required" }, { status: 400 })
    }

    const carIdArray = carIds.split(",").filter((id) => id.trim() !== "")

    if (carIdArray.length === 0) {
      return NextResponse.json({ success: false, error: "No valid car IDs provided" }, { status: 400 })
    }

    console.log("Comparing cars with IDs:", carIdArray)

    // Connect to MongoDB to get car details
    await connectToDatabase()

    // Find cars by IDs
    const cars = await CarAd.find({
      _id: {
        $in: carIdArray
          .map((id) => {
            try {
              return new ObjectId(id)
            } catch (e) {
              console.error(`Invalid ObjectId: ${id}`)
              return null
            }
          })
          .filter(Boolean),
      },
    })

    if (cars.length === 0) {
      return NextResponse.json({ success: false, error: "No cars found for comparison" }, { status: 404 })
    }

    console.log(`Found ${cars.length} cars for comparison`)

    // Format cars for comparison
    const specs = cars.map((car) => ({
      carId: car._id.toString(),
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      transmission: car.transmission,
      engineSize: car.specifications?.engineSize || null,
      horsepower: car.specifications?.horsepower || null,
      torque: car.specifications?.torque || null,
      fuelEconomy: car.specifications?.fuelEconomy || null,
      doors: car.specifications?.doors || null,
      seats: car.specifications?.seats || null,
      color: car.specifications?.exteriorColor || null,
      interiorColor: car.specifications?.interiorColor || null,
    }))

    // Get user ID from cookies - properly awaited
    const cookieStore = cookies()
    // Use a try-catch to handle any potential errors with cookies
    let userId = "anonymous"
    try {
      const userIdCookie = cookieStore.get("userId")
      if (userIdCookie) {
        userId = userIdCookie.value
      }
    } catch (error) {
      console.error("Error getting userId from cookies:", error)
    }

    // Log comparison
    console.log(`User ${userId} compared cars: ${carIdArray.join(", ")}`)

    return NextResponse.json({ success: true, specs })
  } catch (error) {
    console.error("Compare cars error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while comparing cars" }, { status: 500 })
  }
}
