import { Redis } from "@upstash/redis"

// Initialize Redis client using environment variables
// Use console.log to debug the environment variables
console.log("Redis URL:", process.env.REDIS_URL || process.env.KV_URL)
console.log("Redis Token:", process.env.KV_REST_API_TOKEN ? "Token exists" : "Token missing")

const redis = new Redis({
  url: process.env.REDIS_URL || process.env.KV_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN || "",
})

export default redis

// Helper function to create cache keys
export const createCacheKey = (prefix: string, id: string) => `${prefix}:${id}`

// Cache prefixes
export const CACHE_KEYS = {
  CAR_DETAILS: "car:details",
  USER_SESSION: "user:session",
  CAR_VIEWS: "car:views",
  POPULAR_CARS: "popular:cars",
  RECENT_SEARCHES: "user:searches",
}

// Default cache expiration times (in seconds)
export const CACHE_TTL = {
  CAR_DETAILS: 60 * 60 * 24, // 24 hours
  USER_SESSION: 60 * 60 * 24 * 7, // 7 days
  RECENT_SEARCHES: 60 * 60 * 24 * 30, // 30 days
}
