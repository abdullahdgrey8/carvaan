import { db } from "./postgres"
import { searchLogs, featurePopularity } from "./schema"
import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm"

// Log a search query
export async function logSearch(query: string, userId: string | null, filters: any, resultCount: number) {
  try {
    await db.insert(searchLogs).values({
      userId: userId || null,
      query,
      filters,
      resultCount,
    })

    // Update feature popularity for each filter
    if (filters) {
      const features = Object.keys(filters)
      for (const feature of features) {
        await updateFeaturePopularity(feature)
      }
    }

    return true
  } catch (error) {
    console.error("Error logging search:", error)
    return false
  }
}

// Update feature popularity
async function updateFeaturePopularity(feature: string) {
  try {
    // Check if feature exists
    const existingFeature = await db.select().from(featurePopularity).where(eq(featurePopularity.feature, feature))

    if (existingFeature.length > 0) {
      // Update existing feature
      await db
        .update(featurePopularity)
        .set({
          searchCount: existingFeature[0].searchCount + 1,
          lastUpdated: new Date(),
        })
        .where(eq(featurePopularity.feature, feature))
    } else {
      // Insert new feature
      await db.insert(featurePopularity).values({
        feature,
        searchCount: 1,
      })
    }

    return true
  } catch (error) {
    console.error(`Error updating feature popularity for ${feature}:`, error)
    return false
  }
}

// Get popular search queries
export async function getPopularSearchQueries(limit = 10) {
  try {
    const queries = await db.execute(sql`
      SELECT query, COUNT(*) as count
      FROM search_logs
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `)

    return queries
  } catch (error) {
    console.error("Error getting popular search queries:", error)
    return []
  }
}

// Get popular features
export async function getPopularFeatures(limit = 10) {
  try {
    const features = await db.select().from(featurePopularity).orderBy(featurePopularity.searchCount).limit(limit)

    return features
  } catch (error) {
    console.error("Error getting popular features:", error)
    return []
  }
}
