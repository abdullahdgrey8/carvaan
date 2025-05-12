import { db, sql } from "./postgres"
import { carViews } from "./schema"
import { incrementCarView } from "./analytics"

// Log a car view
export async function logCarView(
  carId: string,
  userId: string | null,
  sessionId: string | null,
  deviceType: string | null,
  referrer: string | null,
) {
  try {
    // Also increment view in Redis for real-time analytics
    await incrementCarView(carId)

    // Log view in PostgreSQL for long-term analytics
    await db.insert(carViews).values({
      carId,
      userId: userId || null,
      sessionId: sessionId || null,
      deviceType: deviceType || null,
      referrer: referrer || null,
    })

    return true
  } catch (error) {
    console.error(`Error logging car view for ${carId}:`, error)
    return false
  }
}

// Get view count for a car
export async function getCarViewCount(carId: string) {
  try {
    const result = await sql`
      SELECT COUNT(*) as view_count
      FROM car_views
      WHERE car_id = ${carId}
    `

    return Number.parseInt(result[0]?.view_count || "0")
  } catch (error) {
    console.error(`Error getting view count for ${carId}:`, error)
    return 0
  }
}

// Get view trends by day
export async function getViewTrendsByDay(days = 30) {
  try {
    const trends = await sql`
      SELECT 
        DATE(view_date) as date,
        COUNT(*) as view_count
      FROM car_views
      WHERE view_date >= NOW() - INTERVAL '${days} days'
      GROUP BY date
      ORDER BY date
    `

    return trends
  } catch (error) {
    console.error("Error getting view trends:", error)
    return []
  }
}

// Get most viewed cars
export async function getMostViewedCarsFromPostgres(limit = 10) {
  try {
    const cars = await sql`
      SELECT 
        car_id,
        COUNT(*) as view_count
      FROM car_views
      GROUP BY car_id
      ORDER BY view_count DESC
      LIMIT ${limit}
    `

    return cars
  } catch (error) {
    console.error("Error getting most viewed cars from PostgreSQL:", error)
    return []
  }
}

// Get view distribution by device type
export async function getViewsByDeviceType() {
  try {
    const views = await sql`
      SELECT 
        device_type,
        COUNT(*) as view_count
      FROM car_views
      WHERE device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY view_count DESC
    `

    return views
  } catch (error) {
    console.error("Error getting views by device type:", error)
    return []
  }
}
