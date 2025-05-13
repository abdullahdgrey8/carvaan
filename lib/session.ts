import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Define the shape of a user session
export interface UserSession {
  userId: string;
  fullName: string;
  email: string;
  expiresAt: string;
}

// Create a new session and store it in an in-memory store
const sessionStore = new Map<string, UserSession>();

export async function createSession(userData: {
  userId: string;
  fullName: string;
  email: string;
}): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Session valid for 7 days

  const session: UserSession = {
    ...userData,
    expiresAt: expiresAt.toISOString(),
  };

  // Store in in-memory store
  sessionStore.set(sessionId, session);

  return sessionId;
}

// Retrieve session data
export async function getSession(sessionId: string): Promise<UserSession | null> {
  try {
    // Check in in-memory store
    const session = sessionStore.get(sessionId);

    if (session) {
      // Optionally check for expiration
      const now = new Date();
      if (new Date(session.expiresAt) < now) {
        sessionStore.delete(sessionId);
        return null;
      }
      return session;
    }

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    // Delete from in-memory store
    sessionStore.delete(sessionId);
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}

// Get current session using cookies
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) return null;

    const session = await getSession(sessionId);
    return session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}
