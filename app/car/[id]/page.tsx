"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarImageGallery } from "@/components/car-image-gallery"
import { SellerContactCard } from "@/components/seller-contact-card"
import { CarFeaturesList } from "@/components/car-features-list"
import { MapLocation } from "@/components/map-location"
import { SimilarCars } from "@/components/similar-cars"
import { Separator } from "@/components/ui/separator"
import { Check, Heart, Info, Loader2, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
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
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`/api/cars/${params.id}`)
        const data = await response.json()

        if (!data.success) {
          router.push("/not-found")
          return
        }

        setCar(data.carAd)

        // Check if car is in favorites if logged in
        if (isLoggedIn && userId) {
          const favoriteResponse = await fetch(`/api/favorites?userId=${userId}&carAdId=${params.id}`)
          const favoriteData = await favoriteResponse.json()
          setIsFavorite(favoriteData.isFavorite)
        }
      } catch (error) {
        console.error("Error fetching car details:", error)
        router.push("/not-found")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCarDetails()
    }
  }, [params.id, router, isLoggedIn, userId])

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/car/${params.id}`)
      return
    }

    if (!userId) return

    setIsTogglingFavorite(true)
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${userId}&carAdId=${params.id}`, {
          method: "DELETE",
        })

        const data = await response.json()

        if (data.success) {
          setIsFavorite(false)
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
            carAdId: params.id,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setIsFavorite(true)
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
      setIsTogglingFavorite(false)
    }
  }

  const handleContactSellerOpen = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/car/${params.id}`)
      return
    }
    setIsContactDialogOpen(true)
  }

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingContact(true)

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Message sent",
      description: "Your message has been sent to the seller. They will contact you soon.",
    })

    setIsSubmittingContact(false)
    setIsContactDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading car details...</p>
      </div>
    )
  }

  if (!car) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/browse" className="text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to search results
        </Link>
        <h1 className="text-3xl font-bold">{car.title}</h1>
        <div className="flex items-center mt-2">
          <Badge variant="outline" className="mr-2">
            {car.year}
          </Badge>
          <span className="text-gray-500">{car.mileage?.toLocaleString()} miles</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-gray-500">{car.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Car Images */}
          <CarImageGallery images={car.images} />

          {/* Car Details Tabs */}
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Features</h3>
                  <CarFeaturesList features={car.features} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(car.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Map Location */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <MapLocation location={car.location} coordinates={car.coordinates} />
          </div>

          {/* Similar Cars */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Similar Cars</h3>
            <SimilarCars currentCarId={car.id} />
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Price and Contact Card */}
          <div className="sticky top-24">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-4">${car.price?.toLocaleString()}</div>
                <div className="flex flex-col space-y-4">
                  <Button className="w-full" size="lg" onClick={handleContactSellerOpen}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                  >
                    {isTogglingFavorite ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    )}
                    {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Vehicle Protection Plans Available</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Vehicle History Report Available</span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <SellerContactCard seller={car.seller} onContactClick={handleContactSellerOpen} />
          </div>
        </div>
      </div>

      {/* Contact Seller Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this {car.year} {car.make} {car.model}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  className="col-span-3"
                  rows={4}
                  placeholder={`I'm interested in this ${car.year} ${car.make} ${car.model}. Please contact me with more information.`}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingContact}>
                {isSubmittingContact ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
