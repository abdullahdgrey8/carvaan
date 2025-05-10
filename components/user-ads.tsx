"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserAdsProps {
  userId: string
}

export function UserAds({ userId }: UserAdsProps) {
  const router = useRouter()
  const [userAds, setUserAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user ads from API
    const fetchUserAds = async () => {
      try {
        const response = await fetch(`/api/cars?userId=${userId}`)
        const data = await response.json()

        if (data.success) {
          setUserAds(data.carAds)
        } else {
          console.error("Failed to fetch user ads:", data.error)
        }
      } catch (error) {
        console.error("Error fetching user ads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAds()
  }, [userId])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cars/${id}?userId=${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Update state
        setUserAds(userAds.filter((ad) => ad.id !== id))
      } else {
        console.error("Failed to delete ad:", data.error)
      }
    } catch (error) {
      console.error("Error deleting ad:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading your ads...</p>
      </div>
    )
  }

  if (userAds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't posted any car ads yet.</p>
        <Button asChild>
          <Link href="/post-ad">Post Your First Ad</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {userAds.map((ad) => (
        <div key={ad.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
          <div className="relative h-20 w-32 flex-shrink-0">
            <Image src={ad.image || "/placeholder.svg"} alt={ad.title} fill className="object-cover rounded-md" />
          </div>

          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-medium">{ad.title}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    ad.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : ad.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                  variant="outline"
                >
                  {ad.status === "active" ? "Active" : ad.status === "pending" ? "Pending Approval" : "Inactive"}
                </Badge>
                <span className="text-sm text-gray-500">${ad.price?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {ad.views || 0} views
                </span>
                <span>Posted on {new Date(ad.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/car/${ad.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/edit-ad/${ad.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  onClick={() => handleDelete(ad.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
