import { NextResponse } from "next/server"
import redis from "@/lib/redis"

export async function GET() {
  try {
    // Try to ping Redis
    const result = await redis.ping()
    return NextResponse.json({ connected: result === "PONG" })
  } catch (error) {
    console.error("Redis connection error:", error)
    return NextResponse.json({ connected: false })
  }
}
