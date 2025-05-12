import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import redis, { CACHE_KEYS, CACHE_TTL, createCacheKey } from "./redis"

// Session interface
export interface UserSession {
  userId: string
  fullName: string
  email: string
  expiresAt: string
}

// Create a new session
export async function createSession(userData: {
  userId: string
  fullName: string
  email: string
}): Promise<string> {
  const sessionId = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const session: UserSession = {
    ...userData,
    expiresAt: expiresAt.toISOString(),
  }

  // Store session in Redis
  const sessionKey = createCacheKey(CACHE_KEYS.USER_SESSION, sessionId)
  await redis.set(sessionKey, JSON.stringify(session), { ex: CACHE_TTL.USER_SESSION })

  return sessionId
}

// Get session data
export async function getSession(sessionId: string): Promise<UserSession | null> {
  try {
    const sessionKey = createCacheKey(CACHE_KEYS.USER_SESSION, sessionId)
    const sessionData = await redis.get<string>(sessionKey)

    if (!sessionData) {
      return null
    }

    const session = JSON.parse(sessionData) as UserSession

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      await redis.del(sessionKey)
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessionKey = createCacheKey(CACHE_KEYS.USER_SESSION, sessionId)
    await redis.del(sessionKey)
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

// Get current session from cookies
export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("sessionId")?.value

  if (!sessionId) {
    return null
  }

  return getSession(sessionId)
}
