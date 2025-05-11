"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { EditAdForm } from "@/components/edit-ad-form"
import { Loader2 } from "lucide-react"

export default function EditAdPage() {
  const params = useParams()
  const router = useRouter()
  const [carData, setCarData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const checkAuth = () => {
      const userId = document.cookie.split("; ").find((row) => row.startsWith("userId="))

      if (!userId) {
        router.push("/login?redirect=/edit-ad/" + params.id)
        return
      }

      fetchCarData()
    }

    const fetchCarData = async () => {
      try {
        const response = await fetch(`/api/cars/${params.id}`)
        const data = await response.json()

        if (!data.success) {
          setError("Failed to load car data")
          return
        }

        // Check if user owns this ad
        const userId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("userId="))
          ?.split("=")[1]
        if (userId !== data.carAd.userId) {
          router.push("/not-found")
          return
        }

        setCarData(data.carAd)
      } catch (error) {
        console.error("Error fetching car data:", error)
        setError("An error occurred while loading car data")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading car data...</p>
      </div>
    )
  }

  if (error || !carData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Failed to load car data"}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Car Ad</h1>
      <EditAdForm carData={carData} />
    </div>
  )
}
