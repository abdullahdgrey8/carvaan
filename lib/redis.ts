import { Redis } from "@upstash/redis"

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

export default redis
