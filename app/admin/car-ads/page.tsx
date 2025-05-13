import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { connectToDatabase } from "@/lib/mongodb"
import CarAd from "@/models/CarAd"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { requireAdmin } from "@/lib/admin-auth"

export default async function AdminCarAdsPage() {
  // Check if user is admin
  await requireAdmin()

  let carAds: any[] = []

  try {
    await connectToDatabase()
    carAds = await CarAd.find().sort({ createdAt: -1 }).lean()
  } catch (error) {
    console.error("Error fetching car ads:", error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Car Ads</h1>
        <Button asChild variant="outline">
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Car Ads List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carAds.map((ad) => (
                  <TableRow key={ad._id.toString()}>
                    <TableCell className="font-medium">
                      <Link href={`/car/${ad._id.toString()}`} className="hover:text-blue-600">
                        {ad.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {ad.make} {ad.model}
                    </TableCell>
                    <TableCell>${ad.price?.toLocaleString()}</TableCell>
                    <TableCell>{ad.year}</TableCell>
                    <TableCell>
                      <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
                    </TableCell>
                    <TableCell>{ad.views}</TableCell>
                    <TableCell>{new Date(ad.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
