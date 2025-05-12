import { db, sql } from "./postgres"
import { priceHistory } from "./schema"
import { connectToDatabase } from "./mongodb"
import CarAd from "@/models/CarAd"
import { eq, and } from "drizzle-orm"

// Generate price history data for a specific make and model
export async function generatePriceHistoryData(make: string, model: string) {
  try {
    // Connect to MongoDB to get real price data
    await connectToDatabase()

    // Get current average price from MongoDB
    const carAds = await CarAd.find({
      make: new RegExp(make, "i"),
      model: new RegExp(model, "i"),
    })

    if (carAds.length === 0) {
      console.log(`No cars found for ${make} ${model}`)
      return false
    }

    // Calculate current price statistics
    const prices = carAds.map((car) => car.price)
    const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const sampleSize = prices.length

    // Generate 12 months of price history
    const today = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(today)
      date.setMonth(date.getMonth() - i)

      // Adjust price based on month (older = slightly lower)
      // Add some randomness to make it realistic
      const monthFactor = 1 - i * 0.005 // 0.5% decrease per month
      const randomFactor = 0.98 + Math.random() * 0.04 // ±2% random variation

      const monthAveragePrice = Math.round(averagePrice * monthFactor * randomFactor)
      const monthMinPrice = Math.round(minPrice * monthFactor * randomFactor * 0.9)
      const monthMaxPrice = Math.round(maxPrice * monthFactor * randomFactor * 1.1)

      // Check if entry already exists for this month
      const existingEntry = await db
        .select()
        .from(priceHistory)
        .where(and(eq(priceHistory.make, make), eq(priceHistory.model, model), eq(priceHistory.date, date)))

      if (existingEntry.length === 0) {
        // Insert new price history entry
        await db.insert(priceHistory).values({
          make,
          model,
          date,
          averagePrice: monthAveragePrice,
          minPrice: monthMinPrice,
          maxPrice: monthMaxPrice,
          sampleSize,
        })
      }
    }

    console.log(`Generated price history for ${make} ${model}`)
    return true
  } catch (error) {
    console.error(`Error generating price history for ${make} ${model}:`, error)
    return false
  }
}

// Get price history for a specific make and model
export async function getPriceHistoryFromPostgres(make: string, model: string) {
  try {
    // Check if we have price history data
    const historyData = await db
      .select()
      .from(priceHistory)
      .where(and(eq(priceHistory.make, make), eq(priceHistory.model, model)))
      .orderBy(priceHistory.date)

    // If no data exists, generate it
    if (historyData.length === 0) {
      await generatePriceHistoryData(make, model)

      // Try to get the data again
      return await db
        .select()
        .from(priceHistory)
        .where(and(eq(priceHistory.make, make), eq(priceHistory.model, model)))
        .orderBy(priceHistory.date)
    }

    return historyData
  } catch (error) {
    console.error(`Error getting price history for ${make} ${model}:`, error)
    return []
  }
}

// Get price trends for popular makes
export async function getPopularMakesPriceTrends() {
  try {
    // Get price trends for popular makes
    const trends = await sql`
      WITH popular_makes AS (
        SELECT make, COUNT(*) as count
        FROM car_specs
        GROUP BY make
        ORDER BY count DESC
        LIMIT 5
      )
      SELECT 
        ph.make,
        EXTRACT(MONTH FROM ph.date) as month,
        EXTRACT(YEAR FROM ph.date) as year,
        AVG(ph.average_price) as average_price
      FROM price_history ph
      JOIN popular_makes pm ON ph.make = pm.make
      WHERE ph.date >= NOW() - INTERVAL '6 months'
      GROUP BY ph.make, month, year
      ORDER BY ph.make, year, month
    `

    return trends
  } catch (error) {
    console.error("Error getting popular makes price trends:", error)
    return []
  }
}
