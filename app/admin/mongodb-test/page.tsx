import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import User from "@/models/User"
import CarAd from "@/models/CarAd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function MongoDBTestPage() {
  let connectionStatus = "Not connected"
  let dbStats = null
  let userCount = 0
  let carAdCount = 0
  let error = null

  try {
    // Test MongoDB connection
    await connectToDatabase()
    connectionStatus = "Connected"

    // Get database stats
    const db = mongoose.connection.db
    dbStats = await db.stats()

    // Count documents in collections
    userCount = await User.countDocuments()
    carAdCount = await CarAd.countDocuments()

    // Create a test user if none exist
    if (userCount === 0) {
      const testUser = new User({
        fullName: "Test User",
        email: "test@example.com",
        passwordHash: "$2a$10$K8ZpdrVU.Uh/QhRZ/W5pOeKj9MpVMBzEBwB1ddIBUE/Z9xMa2/iMW", // password123
        phoneNumber: "(123) 456-7890",
        memberSince: "April 2023",
      })
      await testUser.save()
      userCount = 1
    }

    // Create a test car ad if none exist
    if (carAdCount === 0) {
      const user = await User.findOne()
      if (user) {
        const testCarAd = new CarAd({
          userId: user._id,
          title: "2023 Test Car Deluxe",
          make: "test",
          model: "Deluxe",
          year: 2023,
          price: 25000,
          mileage: 0,
          description: "This is a test car ad created to verify MongoDB integration.",
          bodyType: "sedan",
          fuelType: "electric",
          transmission: "automatic",
          features: ["Test Feature 1", "Test Feature 2"],
          location: "Test City, TS",
          images: ["/placeholder.svg?height=400&width=600"],
          status: "active",
          views: 0,
        })
        await testCarAd.save()
        carAdCount = 1
      }
    }
  } catch (err) {
    connectionStatus = "Error"
    error = err instanceof Error ? err.message : "Unknown error"
    console.error("MongoDB connection error:", err)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">MongoDB Connection Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current status of MongoDB connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-semibold ${
                connectionStatus === "Connected"
                  ? "text-green-600"
                  : connectionStatus === "Error"
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {connectionStatus}
            </div>
            {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Counts</CardTitle>
            <CardDescription>Number of documents in collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Users:</span>
                <span className="font-semibold">{userCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Car Ads:</span>
                <span className="font-semibold">{carAdCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {dbStats && (
        <Card>
          <CardHeader>
            <CardTitle>Database Stats</CardTitle>
            <CardDescription>Information about the MongoDB database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="font-semibold">{dbStats.db}</span>
              </div>
              <div className="flex justify-between">
                <span>Collections:</span>
                <span className="font-semibold">{dbStats.collections}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Documents:</span>
                <span className="font-semibold">{dbStats.objects}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Size:</span>
                <span className="font-semibold">{(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Indexes:</span>
                <span className="font-semibold">{dbStats.indexes}</span>
              </div>
              <div className="flex justify-between">
                <span>Index Size:</span>
                <span className="font-semibold">{(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
