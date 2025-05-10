"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CarListingsProps {
  onCountChange?: (count: number) => void
}

export function CarListings({ onCountChange }: CarListingsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<Record<string, boolean>>({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = () => {
      // Check cookies for session
      const userIdCookie = document.cookie.split("; ").find((row) => row.startsWith("userId="))

      if (userIdCookie) {
        const userIdValue = userIdCookie.split("=")[1]
        setIsLoggedIn(true)
        setUserId(userIdValue)
      } else {
        setIsLoggedIn(false)
        setUserId(null)
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true)
      try {
        // Convert searchParams to object
        const paramsObj: { [key: string]: string | string[] } = {}
        searchParams.forEach((value, key) => {
          paramsObj[key] = value
        })

        // Fetch cars from API
        const response = await fetch(`/api/cars/search?${new URLSearchParams(paramsObj as any).toString()}`)
        const data = await response.json()

        if (data.success) {
          setCars(data.carAds)

          if (onCountChange) {
            onCountChange(data.carAds.length)
          }

          // Check favorites status for each car if logged in
          if (isLoggedIn && userId) {
            const favoritesStatus: Record<string, boolean> = {}
            for (const car of data.carAds) {
              const favoriteResponse = await fetch(`/api/favorites?userId=${userId}&carAdId=${car.id}`)
              const favoriteData = await favoriteResponse.json()
              favoritesStatus[car.id] = favoriteData.isFavorite
            }
            setFavorites(favoritesStatus)
          }
        } else {
          console.error("Failed to fetch cars:", data.error)
        }
      } catch (error) {
        console.error("Error fetching cars:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [searchParams, isLoggedIn, userId, onCountChange])

  const handleToggleFavorite = async (carId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!isLoggedIn) {
      router.push(`/login?redirect=/browse`)
      return
    }

    if (!userId) return

    setIsTogglingFavorite((prev) => ({ ...prev, [carId]: true }))
    try {
      if (favorites[carId]) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${userId}&carAdId=${carId}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (data.success) {
          setFavorites((prev) => ({ ...prev, [carId]: false }))
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
      } else {
        // Add to favorites
        const response = await fetch(`/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            carAdId: carId,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setFavorites((prev) => ({ ...prev, [carId]: true }))
          toast({
            title: "Added to favorites",
            description: "This car has been added to your favorites.",
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to add to favorites",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTogglingFavorite((prev) => ({ ...prev, [carId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2">Loading cars...</p>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No cars found matching your search criteria.</p>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            <Link href={`/car/${car.id}`}>
              <div className="relative h-48 w-full">
                <Image src={car.image || "/placeholder.svg"} alt={car.title} fill className="object-cover" />
              </div>
            </Link>
            {car.featured && <Badge className="absolute top-2 right-2 bg-blue-600">Featured</Badge>}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
              onClick={(e) => handleToggleFavorite(car.id, e)}
              disabled={isTogglingFavorite[car.id]}
            >
              {isTogglingFavorite[car.id] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${favorites[car.id] ? "fill-red-500 text-red-500" : ""}`} />
              )}
              <span className="sr-only">Add to favorites</span>
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
