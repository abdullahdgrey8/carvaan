import redis, { CACHE_KEYS, CACHE_TTL, createCacheKey } from "./redis"

// Generic function to get data from cache
export async function getFromCache<T>(prefix: string, id: string): Promise<T | null> {
  try {
    const cacheKey = createCacheKey(prefix, id)
    const cachedData = await redis.get(cacheKey)
    return cachedData as T | null
  } catch (error) {
    console.error(`Error getting data from cache (${prefix}:${id}):`, error)
    return null
  }
}

// Generic function to set data in cache
export async function setInCache<T>(
  prefix: string,
  id: string,
  data: T,
  expiration: number = CACHE_TTL.CAR_DETAILS,
): Promise<void> {
  try {
    const cacheKey = createCacheKey(prefix, id)
    await redis.set(cacheKey, data, { ex: expiration })
  } catch (error) {
    console.error(`Error setting data in cache (${prefix}:${id}):`, error)
  }
}

// Function to invalidate cache
export async function invalidateCache(prefix: string, id: string): Promise<void> {
  try {
    const cacheKey = createCacheKey(prefix, id)
    await redis.del(cacheKey)
  } catch (error) {
    console.error(`Error invalidating cache (${prefix}:${id}):`, error)
  }
}

// Car details specific cache functions
export async function getCachedCarDetails(carId: string) {
  return getFromCache(CACHE_KEYS.CAR_DETAILS, carId)
}

export async function setCachedCarDetails(carId: string, carData: any) {
  return setInCache(CACHE_KEYS.CAR_DETAILS, carId, carData)
}

export async function invalidateCarCache(carId: string) {
  return invalidateCache(CACHE_KEYS.CAR_DETAILS, carId)
}
