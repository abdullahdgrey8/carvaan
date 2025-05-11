"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Heart } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FavoritesTabProps {
  userId: string
}

export function FavoritesTab({ userId }: FavoritesTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites?userId=${userId}`)
        const data = await response.json()

        if (data.success) {
          setFavorites(data.favorites || [])
        } else {
          console.error("Failed to fetch favorites:", data.error)
        }
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [userId])

  const handleRemoveFromFavorites = async (carId: string) => {
    try {
      const response = await fetch(`/api/favorites?userId=${userId}&carAdId=${carId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        // Update state
        setFavorites(favorites.filter((car) => car.id !== carId))
        toast({
          title: "Removed from favorites",
          description: "This car has been removed from your favorites.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove from favorites",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing from favorites:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading your favorites...</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">You haven't saved any cars to your favorites yet.</p>
        <Button asChild>
          <Link href="/browse">Browse Cars</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            <Link href={`/car/${car.id}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={car.image || "/placeholder.svg"}
                  alt={car.title}
                  fill
                  className="object-cover"
                  unoptimized={car.image?.startsWith("http")}
                />
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
              onClick={() => handleRemoveFromFavorites(car.id)}
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span className="sr-only">Remove from favorites</span>
            </Button>
          </div>
          <CardContent className="p-4">
            <Link href={`/car/${car.id}`}>
              <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">{car.title}</h3>
            </Link>
            <p className="text-xl font-bold text-blue-600 mb-2">${car.price?.toLocaleString()}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{car.year}</span>
              <span>{car.mileage?.toLocaleString()} mi</span>
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 bg-gray-50 text-sm text-gray-500">{car.location}</CardFooter>
        </Card>
      ))}
    </div>
  )
}
