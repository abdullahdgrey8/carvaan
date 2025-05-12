import { connectToDatabase } from "./mongodb"
import CarAd from "@/models/CarAd"
import { db } from "./postgres"
import { carSpecs } from "./schema"
import { eq } from "drizzle-orm"

// Sync a single car ad from MongoDB to PostgreSQL
export async function syncCarToPostgres(carId: string) {
  try {
    await connectToDatabase()

    // Get car from MongoDB
    const carAd = await CarAd.findById(carId)
    if (!carAd) {
      console.log(`Car ad not found in MongoDB: ${carId}`)
      return
    }

    // Check if car already exists in PostgreSQL
    const existingCar = await db.select().from(carSpecs).where(eq(carSpecs.carId, carId))

    if (existingCar.length > 0) {
      // Update existing car
      await db
        .update(carSpecs)
        .set({
          make: carAd.make,
          model: carAd.model,
          year: carAd.year,
          mileage: carAd.mileage,
          price: carAd.price,
          bodyType: carAd.bodyType as any,
          fuelType: carAd.fuelType as any,
          transmission: carAd.transmission as any,
          engineSize: carAd.specifications?.engineSize || null,
          horsepower: carAd.specifications?.horsepower || null,
          torque: carAd.specifications?.torque || null,
          fuelEconomy: carAd.specifications?.fuelEconomy || null,
          doors: carAd.specifications?.doors || null,
          seats: carAd.specifications?.seats || null,
          color: carAd.specifications?.exteriorColor || null,
          interiorColor: carAd.specifications?.interiorColor || null,
          vin: carAd.specifications?.vin || null,
          updatedAt: new Date(),
        })
        .where(eq(carSpecs.carId, carId))

      console.log(`Updated car in PostgreSQL: ${carId}`)
    } else {
      // Insert new car
      await db.insert(carSpecs).values({
        carId: carId,
        make: carAd.make,
        model: carAd.model,
        year: carAd.year,
        mileage: carAd.mileage,
        price: carAd.price,
        bodyType: carAd.bodyType as any,
        fuelType: carAd.fuelType as any,
        transmission: carAd.transmission as any,
        engineSize: carAd.specifications?.engineSize || null,
        horsepower: carAd.specifications?.horsepower || null,
        torque: carAd.specifications?.torque || null,
        fuelEconomy: carAd.specifications?.fuelEconomy || null,
        doors: carAd.specifications?.doors || null,
        seats: carAd.specifications?.seats || null,
        color: carAd.specifications?.exteriorColor || null,
        interiorColor: carAd.specifications?.interiorColor || null,
        vin: carAd.specifications?.vin || null,
      })

      console.log(`Inserted car into PostgreSQL: ${carId}`)
    }

    return true
  } catch (error) {
    console.error(`Error syncing car to PostgreSQL: ${carId}`, error)
    return false
  }
}

// Sync all cars from MongoDB to PostgreSQL
export async function syncAllCarsToPostgres() {
  try {
    await connectToDatabase()

    const carAds = await CarAd.find()
    console.log(`Found ${carAds.length} cars in MongoDB to sync`)

    let successCount = 0
    let failCount = 0

    for (const carAd of carAds) {
      const success = await syncCarToPostgres(carAd._id.toString())
      if (success) {
        successCount++
      } else {
        failCount++
      }
    }

    console.log(`Sync completed: ${successCount} succeeded, ${failCount} failed`)
    return { successCount, failCount }
  } catch (error) {
    console.error("Error syncing all cars to PostgreSQL:", error)
    throw error
  }
}

// Delete a car from PostgreSQL when deleted from MongoDB
export async function deleteCarFromPostgres(carId: string) {
  try {
    await db.delete(carSpecs).where(eq(carSpecs.carId, carId))
    console.log(`Deleted car from PostgreSQL: ${carId}`)
    return true
  } catch (error) {
    console.error(`Error deleting car from PostgreSQL: ${carId}`, error)
    return false
  }
}
