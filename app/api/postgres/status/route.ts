import { NextResponse } from "next/server"
import { checkPostgresConnection } from "@/lib/postgres"

export async function GET() {
  try {
    const connected = await checkPostgresConnection()
    return NextResponse.json({ connected })
  } catch (error) {
    console.error("PostgreSQL connection error:", error)
    return NextResponse.json({ connected: false })
  }
}
