import redis, { CACHE_KEYS, createCacheKey } from "./redis"

const CACHE_TTL = {
  RECENT_SEARCHES: 60 * 60, // 1 hour
}

// Increment car view count
export async function incrementCarView(carId: string): Promise<number> {
  try {
    // Check if Redis is properly configured
    if (!process.env.REDIS_URL && !process.env.KV_URL) {
      console.warn("Redis URL is not configured. Skipping view increment.")
      return 0
    }

    const viewsKey = createCacheKey(CACHE_KEYS.CAR_VIEWS, carId)
    const newCount = await redis.incr(viewsKey)

    // Also add to sorted set for popular cars
    await redis.zadd(CACHE_KEYS.POPULAR_CARS, { score: newCount, member: carId })

    return newCount
  } catch (error) {
    console.error(`Error incrementing view count for car ${carId}:`, error)
    return 0
  }
}

// Get car view count
export async function getCarViewCount(carId: string): Promise<number> {
  try {
    // Check if Redis is properly configured
    if (!process.env.REDIS_URL && !process.env.KV_URL) {
      console.warn("Redis URL is not configured. Returning 0 for car view count.")
      return 0
    }

    const viewsKey = createCacheKey(CACHE_KEYS.CAR_VIEWS, carId)
    const count = await redis.get<number>(viewsKey)
    return count || 0
  } catch (error) {
    console.error(`Error getting view count for car ${carId}:`, error)
    return 0
  }
}

// Get most viewed cars
export async function getMostViewedCars(limit = 10): Promise<string[]> {
  try {
    // Check if Redis is properly configured
    if (!process.env.REDIS_URL && !process.env.KV_URL) {
      console.warn("Redis URL is not configured. Returning empty array for most viewed cars.")
      return []
    }

    // Get top cars by views from sorted set (highest to lowest)
    const topCars = await redis.zrange(CACHE_KEYS.POPULAR_CARS, 0, limit - 1, { rev: true })
    return topCars
  } catch (error) {
    console.error("Error getting most viewed cars:", error)
    return []
  }
}

// Track user search
export async function trackUserSearch(userId: string, searchQuery: string): Promise<void> {
  try {
    if (!userId || !searchQuery) return

    // Check if Redis is properly configured
    if (!process.env.REDIS_URL && !process.env.KV_URL) {
      console.warn("Redis URL is not configured. Skipping search tracking.")
      return
    }

    const searchKey = createCacheKey(CACHE_KEYS.RECENT_SEARCHES, userId)

    // Add to list with timestamp
    const searchData = JSON.stringify({
      query: searchQuery,
      timestamp: new Date().toISOString(),
    })

    // Use LPUSH to add to the beginning of the list
    await redis.lpush(searchKey, searchData)

    // Trim list to keep only the most recent 10 searches
    await redis.ltrim(searchKey, 0, 9)

    // Set expiration on the key if it doesn't exist
    await redis.expire(searchKey, CACHE_TTL.RECENT_SEARCHES)
  } catch (error) {
    console.error(`Error tracking search for user ${userId}:`, error)
  }
}

// Get user recent searches
export async function getUserRecentSearches(userId: string): Promise<{ query: string; timestamp: string }[]> {
  try {
    if (!userId) return []

    const searchKey = createCacheKey(CACHE_KEYS.RECENT_SEARCHES, userId)
    const searches = await redis.lrange(searchKey, 0, 9)

    return searches.map((search) => JSON.parse(search))
  } catch (error) {
    console.error(`Error getting recent searches for user ${userId}:`, error)
    return []
  }
}

// Get price history data
export async function getPriceHistory(make: string, model: string): Promise<{ date: string; price: number }[]> {
  try {
    const key = `price:history:${make}:${model}`
    const data = await redis.get<string>(key)

    if (!data) {
      // Generate mock data if no real data exists
      const mockData = generateMockPriceHistory()
      await redis.set(key, JSON.stringify(mockData), { ex: 60 * 60 * 24 }) // 24 hours
      return mockData
    }

    return JSON.parse(data)
  } catch (error) {
    console.error(`Error getting price history for ${make} ${model}:`, error)
    return generateMockPriceHistory()
  }
}

// Helper function to generate mock price history data
function generateMockPriceHistory(): { date: string; price: number }[] {
  const data = []
  const today = new Date()
  const basePrice = 20000 + Math.random() * 10000

  for (let i = 0; i < 12; i++) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)

    // Random price fluctuation (±5%)
    const fluctuation = 0.95 + Math.random() * 0.1
    const price = Math.round(basePrice * fluctuation * (1 - i * 0.01))

    data.unshift({
      date: date.toISOString().split("T")[0],
      price,
    })
  }

  return data
}
