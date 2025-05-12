import { NextResponse } from "next/server"
import { getCarSpecsForComparison, logCarComparison } from "@/lib/comparison-service"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const carIds = url.searchParams.get("carIds")

    if (!carIds) {
      return NextResponse.json({ success: false, error: "Car IDs are required" }, { status: 400 })
    }

    const carIdArray = carIds.split(",")

    // Get car specs for comparison
    const specs = await getCarSpecsForComparison(carIdArray)

    if (specs.length === 0) {
      return NextResponse.json({ success: false, error: "No cars found for comparison" }, { status: 404 })
    }

    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value

    // Log comparison
    logCarComparison(userId || null, carIdArray).catch((error) => {
      console.error("Error logging car comparison:", error)
    })

    return NextResponse.json({ success: true, specs })
  } catch (error) {
    console.error("Compare cars error:", error)
    return NextResponse.json({ success: false, error: "An error occurred while comparing cars" }, { status: 500 })
  }
}
