import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import CarAd from "@/models/CarAd"
import { getMostViewedCars } from "@/lib/analytics"
import redis from "@/lib/redis"
import { PriceHistoryChart } from "@/components/price-history-chart"
import { checkPostgresConnection } from "@/lib/postgres"
import { sql } from "@/lib/postgres"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminAnalyticsPage() {
  let userCount = 0
  let carAdCount = 0
  let totalViews = 0
  let popularCarIds: string[] = []
  let recentSearches: { query: string; count: number }[] = []
  let postgresConnected = false
  let popularSearches: any[] = []
  let popularFeatures: any[] = []
  let viewsByDevice: any[] = []
  let viewTrends: any[] = []

  try {
    await connectToDatabase()

    // Get counts
    userCount = await User.countDocuments()
    carAdCount = await CarAd.countDocuments()

    // Get total views from MongoDB
    const viewsAggregation = await CarAd.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
    totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0

    // Get popular car IDs from Redis
    popularCarIds = await getMostViewedCars(5)

    // Get popular cars from MongoDB
    const popularCars = await CarAd.find({
      _id: { $in: popularCarIds.map((id) => id) },
    })

    // Get recent searches from Redis
    const searchKeys = await redis.keys("user:searches:*")
    const searchCounts: Record<string, number> = {}

    // Process each search key
    for (const key of searchKeys) {
      const searches = await redis.lrange(key, 0, -1)
      for (const searchJson of searches) {
        try {
          const search = JSON.parse(searchJson)
          const query = search.query.toLowerCase()
          searchCounts[query] = (searchCounts[query] || 0) + 1
        } catch (e) {
          console.error("Error parsing search JSON:", e)
        }
      }
    }

    // Convert to array and sort by count
    recentSearches = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Check PostgreSQL connection
    postgresConnected = await checkPostgresConnection()

    if (postgresConnected) {
      // Get popular searches from PostgreSQL
      const searchResults = await sql`
        SELECT query, COUNT(*) as count
        FROM search_logs
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `
      popularSearches = searchResults

      // Get popular features from PostgreSQL
      const featureResults = await sql`
        SELECT feature, search_count
        FROM feature_popularity
        ORDER BY search_count DESC
        LIMIT 10
      `
      popularFeatures = featureResults

      // Get views by device type from PostgreSQL
      const deviceResults = await sql`
        SELECT 
          COALESCE(device_type, 'Unknown') as device_type,
          COUNT(*) as count
        FROM car_views
        GROUP BY device_type
        ORDER BY count DESC
      `
      viewsByDevice = deviceResults

      // Get view trends from PostgreSQL
      const trendResults = await sql`
        SELECT 
          DATE(view_date) as date,
          COUNT(*) as count
        FROM car_views
        WHERE view_date >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date
      `
      viewTrends = trendResults
    }
  } catch (error) {
    console.error("Error fetching admin analytics data:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin">Back to Admin</Link>
          </Button>
          {!postgresConnected && (
            <Button asChild>
              <Link href="/api/postgres/setup">Setup PostgreSQL</Link>
            </Button>
          )}
        </div>
      </div>

      {!postgresConnected && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              PostgreSQL is not connected. Some analytics features may be limited. Click the "Setup PostgreSQL" button
              to initialize the database and sync data.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered users count</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Car Ads</CardTitle>
            <CardDescription>Published car advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{carAdCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Cumulative car ad views</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="searches" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="searches">Search Analytics</TabsTrigger>
          <TabsTrigger value="views">View Analytics</TabsTrigger>
          <TabsTrigger value="prices">Price Analytics</TabsTrigger>
          <TabsTrigger value="popular">Popular Cars</TabsTrigger>
        </TabsList>

        <TabsContent value="searches">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Popular Searches (Redis)</CardTitle>
                <CardDescription>Most frequent search queries from Redis</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSearches.length > 0 ? (
                  <div className="space-y-4">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">{search.query}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {search.count} {search.count === 1 ? "search" : "searches"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No search data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Searches (PostgreSQL)</CardTitle>
                <CardDescription>Most frequent search queries from PostgreSQL</CardDescription>
              </CardHeader>
              <CardContent>
                {postgresConnected && popularSearches.length > 0 ? (
                  <div className="space-y-4">
                    {popularSearches.map((search, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">{search.query}</span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {search.count} {search.count === 1 ? "search" : "searches"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {postgresConnected ? "No search data available" : "PostgreSQL not connected"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Popular Features</CardTitle>
                <CardDescription>Most searched car features</CardDescription>
              </CardHeader>
              <CardContent>
                {postgresConnected && popularFeatures.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularFeatures.map((feature, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <p className="font-medium capitalize">{feature.feature}</p>
                          <p className="text-sm text-gray-500">{feature.search_count} searches</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {postgresConnected ? "No feature data available" : "PostgreSQL not connected"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="views">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>View Trends (Last 30 Days)</CardTitle>
                <CardDescription>Daily car view counts</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {postgresConnected && viewTrends.length > 0 ? (
                  <div className="h-full">
                    {/* View trends chart would go here */}
                    <p className="text-center">View trend data available ({viewTrends.length} days)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      {postgresConnected ? "No view trend data available" : "PostgreSQL not connected"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Views by Device Type</CardTitle>
                <CardDescription>Distribution of views across devices</CardDescription>
              </CardHeader>
              <CardContent>
                {postgresConnected && viewsByDevice.length > 0 ? (
                  <div className="space-y-4">
                    {viewsByDevice.map((device, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium capitalize">{device.device_type}</span>
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {device.count} views
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {postgresConnected ? "No device data available" : "PostgreSQL not connected"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Cars</CardTitle>
                <CardDescription>Most viewed car listings</CardDescription>
              </CardHeader>
              <CardContent>
                {popularCarIds.length > 0 ? (
                  <div className="space-y-4">
                    {popularCarIds.map((carId, index) => (
                      <div key={carId} className="flex justify-between items-center border-b pb-2">
                        <Link href={`/car/${carId}`} className="font-medium hover:text-blue-600">
                          Car ID: {carId}
                        </Link>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          #{index + 1} most viewed
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No popular cars data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prices">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceHistoryChart make="toyota" model="Camry" />
            <PriceHistoryChart make="honda" model="Accord" />
            <PriceHistoryChart make="ford" model="F-150" />
            <PriceHistoryChart make="tesla" model="Model 3" />
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Cars</CardTitle>
                <CardDescription>Most viewed car listings</CardDescription>
              </CardHeader>
              <CardContent>
                {popularCarIds.length > 0 ? (
                  <div className="space-y-4">
                    {popularCarIds.map((carId, index) => (
                      <div key={carId} className="flex justify-between items-center border-b pb-2">
                        <Link href={`/car/${carId}`} className="font-medium hover:text-blue-600">
                          Car ID: {carId}
                        </Link>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          #{index + 1} most viewed
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No popular cars data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
