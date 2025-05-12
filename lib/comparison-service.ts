import { db, sql } from "./postgres"
import { carComparisons, carSpecs } from "./schema"
import { inArray } from "drizzle-orm"

// Log a car comparison
export async function logCarComparison(userId: string | null, carIds: string[]) {
  try {
    await db.insert(carComparisons).values({
      userId: userId || null,
      carIds,
    })

    return true
  } catch (error) {
    console.error("Error logging car comparison:", error)
    return false
  }
}

// Get car specs for comparison
export async function getCarSpecsForComparison(carIds: string[]) {
  try {
    const specs = await db.select().from(carSpecs).where(inArray(carSpecs.carId, carIds))

    return specs
  } catch (error) {
    console.error("Error getting car specs for comparison:", error)
    return []
  }
}

// Get popular car comparisons
export async function getPopularCarComparisons(limit = 10) {
  try {
    const comparisons = await sql`
      SELECT 
        car_ids,
        COUNT(*) as comparison_count
      FROM car_comparisons
      GROUP BY car_ids
      ORDER BY comparison_count DESC
      LIMIT ${limit}
    `

    return comparisons
  } catch (error) {
    console.error("Error getting popular car comparisons:", error)
    return []
  }
}
