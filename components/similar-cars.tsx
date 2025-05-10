"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { getSimilarCarAds } from "@/lib/car-ads"

interface SimilarCarsProps {
  currentCarId: string
}

export function SimilarCars({ currentCarId }: SimilarCarsProps) {
  const [similarCars, setSimilarCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarCars = async () => {
      try {
        const cars = await getSimilarCarAds(currentCarId)
        setSimilarCars(cars)
      } catch (error) {
        console.error("Error fetching similar cars:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarCars()
  }, [currentCarId])

  if (isLoading) {
    return <div className="text-center py-4">Loading similar cars...</div>
  }

  if (similarCars.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No similar cars found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {similarCars.map((car) => (
        <Link key={car.id} href={`/car/${car.id}`}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <div className="relative h-32 w-full">
              <Image src={car.image || "/placeholder.svg"} alt={car.title} fill className="object-cover" />
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium text-sm truncate">{car.title}</h4>
              <p className="text-blue-600 font-bold">${car.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{car.location}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
