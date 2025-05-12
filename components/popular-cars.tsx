"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export function PopularCars() {
  const [popularCars, setPopularCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularCars = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/analytics?type=popular")

        if (!response.ok) {
          throw new Error(`Failed to fetch popular cars: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setPopularCars(data.cars || [])
        } else {
          setError(data.error || "Failed to fetch popular cars")
          console.error("Failed to fetch popular cars:", data.error)
        }
      } catch (error) {
        setError("Error loading popular cars. Please try again later.")
        console.error("Error fetching popular cars:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularCars()
  }, [])

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2">Loading popular cars...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (popularCars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No popular cars available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {popularCars.map((car) => (
        <Link key={car.id} href={`/car/${car.id}`}>
          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={car.image || "/placeholder.svg?height=200&width=300"}
                alt={car.title}
                fill
                className="object-cover"
                unoptimized={car.image?.startsWith("http")}
              />
              <Badge className="absolute top-2 right-2 bg-blue-600">Popular</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{car.title}</h3>
              <p className="text-xl font-bold text-blue-600 mb-2">${car.price?.toLocaleString()}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{car.year}</span>
                <span>{car.mileage?.toLocaleString() || "N/A"} mi</span>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-2 bg-gray-50 text-sm text-gray-500">{car.location}</CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
