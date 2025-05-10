"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFeaturedCarAds } from "@/lib/car-ads"

export function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const cars = await getFeaturedCarAds()
        setFeaturedCars(cars)
      } catch (error) {
        console.error("Error fetching featured cars:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedCars()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading featured cars...</div>
  }

  if (featuredCars.length === 0) {
    return <div className="text-center py-8">No featured cars available at the moment.</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredCars.map((car) => (
        <Link key={car.id} href={`/car/${car.id}`}>
          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <Image src={car.image || "/placeholder.svg"} alt={car.title} fill className="object-cover" />
              {car.featured && <Badge className="absolute top-2 right-2 bg-blue-600">Featured</Badge>}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{car.title}</h3>
              <p className="text-xl font-bold text-blue-600 mb-2">${car.price.toLocaleString()}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{car.year}</span>
                <span>{car.mileage.toLocaleString()} mi</span>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-2 bg-gray-50 text-sm text-gray-500">{car.location}</CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
