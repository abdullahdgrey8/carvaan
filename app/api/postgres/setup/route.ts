import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/migrations"
import { syncAllCarsToPostgres } from "@/lib/sync-service"
import { checkPostgresConnection } from "@/lib/postgres"

export async function GET(request: Request) {
  try {
    // Check if PostgreSQL is connected
    const isConnected = await checkPostgresConnection()

    if (!isConnected) {
      return NextResponse.json({ success: false, error: "PostgreSQL connection failed" }, { status: 500 })
    }

    // Run migrations
    await runMigrations()

    // Sync all cars from MongoDB to PostgreSQL
    const syncResult = await syncAllCarsToPostgres()

    return NextResponse.json({
      success: true,
      message: "PostgreSQL setup completed successfully",
      syncResult,
    })
  } catch (error) {
    console.error("PostgreSQL setup error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during PostgreSQL setup" }, { status: 500 })
  }
}
