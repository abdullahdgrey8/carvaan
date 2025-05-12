import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the Neon PostgreSQL client
const sql = neon(
  process.env.POSTGRES_URL ||
    "postgresql://neondb_owner:npg_htDBy4pxYeO5@ep-young-wind-a4glomle-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
)
export const db = drizzle(sql)

// Export the raw SQL executor for direct queries
export { sql }

// Helper function to check if PostgreSQL is connected
export async function checkPostgresConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT 1 as connected`
    return result[0]?.connected === 1
  } catch (error) {
    console.error("PostgreSQL connection error:", error)
    return false
  }
}
