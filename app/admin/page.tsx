import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import CarAd from "@/models/CarAd"
import { DatabaseStatus } from "@/components/database-status"
import { requireAdmin } from "@/lib/admin-auth"

export default async function AdminPage() {
  // Check if user is admin
  await requireAdmin()

  let userCount = 0
  let carAdCount = 0
  let recentUsers: any[] = []
  let recentAds: any[] = []

  try {
    await connectToDatabase()

    // Get counts
    userCount = await User.countDocuments()
    carAdCount = await CarAd.countDocuments()

    // Get recent users
    recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean()

    // Get recent car ads
    recentAds = await CarAd.find().sort({ createdAt: -1 }).limit(5).lean()
  } catch (error) {
    console.error("Error fetching admin data:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/mongodb-test">Test MongoDB Connection</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/init">Initialize Database</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/postgres/setup">Setup PostgreSQL</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Car Ads</CardTitle>
            <CardDescription>Total car advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{carAdCount}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/car-ads">View All Car Ads</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View site analytics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              <span className="text-blue-600">📊</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>

        <DatabaseStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id.toString()} className="border-b pb-2">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Car Ads</CardTitle>
            <CardDescription>Latest car advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAds.length > 0 ? (
              <div className="space-y-4">
                {recentAds.map((ad) => (
                  <div key={ad._id.toString()} className="border-b pb-2">
                    <p className="font-medium">{ad.title}</p>
                    <div className="flex justify-between text-sm">
                      <span>${ad.price.toLocaleString()}</span>
                      <span className="text-gray-500">{ad.location}</span>
                    </div>
                    <p className="text-xs text-gray-400">Posted: {new Date(ad.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No car ads found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
