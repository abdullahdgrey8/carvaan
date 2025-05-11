"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Info } from "lucide-react"
import { updateCarAd } from "@/lib/car-ads"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

const carAdSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().regex(/^\d{4}$/, "Year must be a 4-digit number"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  mileage: z.string().regex(/^\d+$/, "Mileage must be a valid number"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  bodyType: z.string().min(1, "Body type is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  features: z.array(z.string()).optional(),
  location: z.string().min(1, "Location is required"),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  vin: z.string().optional(),
  doors: z.string().optional(),
  condition: z.string().optional(),
})

type CarAdFormData = z.infer<typeof carAdSchema>

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i)

const makeOptions = [
  "toyota",
  "honda",
  "ford",
  "chevrolet",
  "bmw",
  "mercedes",
  "audi",
  "tesla",
  "nissan",
  "hyundai",
  "kia",
  "subaru",
  "mazda",
  "lexus",
  "volkswagen",
  "jeep",
]

const locationOptions = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Fort Worth, TX",
  "Columbus, OH",
  "San Francisco, CA",
]

const featureOptions = [
  "Leather Seats",
  "Navigation System",
  "Bluetooth",
  "Backup Camera",
  "Sunroof/Moonroof",
  "Heated Seats",
  "Remote Start",
  "Keyless Entry",
  "Blind Spot Monitoring",
  "Lane Departure Warning",
  "Apple CarPlay/Android Auto",
  "Premium Sound System",
  "Adaptive Cruise Control",
  "Parking Sensors",
  "360-degree Camera",
  "Heated Steering Wheel",
  "Ventilated Seats",
  "Third Row Seating",
  "Tow Package",
]

interface EditAdFormProps {
  carData: any
}

export function EditAdForm({ carData }: EditAdFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CarAdFormData>({
    title: "",
    make: "",
    model: "",
    year: currentYear.toString(),
    price: "",
    mileage: "",
    description: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    features: [],
    location: "",
    exteriorColor: "",
    interiorColor: "",
    vin: "",
    doors: "",
    condition: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CarAdFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // Initialize form data from carData
  useEffect(() => {
    if (carData) {
      setFormData({
        title: carData.title || "",
        make: carData.make || "",
        model: carData.model || "",
        year: carData.year?.toString() || currentYear.toString(),
        price: carData.price?.toString() || "",
        mileage: carData.mileage?.toString() || "",
        description: carData.description || "",
        bodyType: carData.bodyType || "",
        fuelType: carData.fuelType || "",
        transmission: carData.transmission || "",
        features: carData.features || [],
        location: carData.location || "",
        exteriorColor: carData.specifications?.exteriorColor || "",
        interiorColor: carData.specifications?.interiorColor || "",
        vin: carData.specifications?.vin || "",
        doors: carData.specifications?.doors || "",
        condition: carData.specifications?.condition || "",
      })
      setSelectedFeatures(carData.features || [])
    }
  }, [carData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string },
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof CarAdFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures((prev) => [...prev, feature])
      setFormData((prev) => ({ ...prev, features: [...(prev.features || []), feature] }))
    } else {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature))
      setFormData((prev) => ({
        ...prev,
        features: (prev.features || []).filter((f) => f !== feature),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    try {
      // Validate form data
      const validatedData = carAdSchema.parse(formData)
      setErrors({})
      setIsSubmitting(true)

      // Call update car ad function
      const result = await updateCarAd(carData.id, validatedData)

      if (result.success) {
        // Redirect to the car ad page
        router.push(`/car/${carData.id}`)
      } else {
        setServerError(result.error || "An error occurred while updating your ad")
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Partial<Record<keyof CarAdFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CarAdFormData] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        // Handle other errors
        setServerError("An unexpected error occurred. Please try again.")
        console.error(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Car Details</CardTitle>
          <CardDescription>Edit the basic information about your car</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Ad Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 2022 Toyota Camry XSE - Excellent Condition"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Select value={formData.make} onValueChange={(value) => handleChange({ name: "make", value })}>
                <SelectTrigger id="make" className={errors.make ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {makeOptions.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make.charAt(0).toUpperCase() + make.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Camry"
                className={errors.model ? "border-red-500" : ""}
              />
              {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year} onValueChange={(value) => handleChange({ name: "year", value })}>
                <SelectTrigger id="year" className={errors.year ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 25000"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g. 15000"
                className={errors.mileage ? "border-red-500" : ""}
              />
              {errors.mileage && <p className="text-sm text-red-500">{errors.mileage}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyType">Body Type</Label>
              <Select value={formData.bodyType} onValueChange={(value) => handleChange({ name: "bodyType", value })}>
                <SelectTrigger id="bodyType" className={errors.bodyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Body Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                  <SelectItem value="wagon">Wagon</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                </SelectContent>
              </Select>
              {errors.bodyType && <p className="text-sm text-red-500">{errors.bodyType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={formData.fuelType} onValueChange={(value) => handleChange({ name: "fuelType", value })}>
                <SelectTrigger id="fuelType" className={errors.fuelType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="plugin_hybrid">Plug-in Hybrid</SelectItem>
                </SelectContent>
              </Select>
              {errors.fuelType && <p className="text-sm text-red-500">{errors.fuelType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) => handleChange({ name: "transmission", value })}
              >
                <SelectTrigger id="transmission" className={errors.transmission ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="cvt">CVT</SelectItem>
                  <SelectItem value="semi_automatic">Semi-Automatic</SelectItem>
                </SelectContent>
              </Select>
              {errors.transmission && <p className="text-sm text-red-500">{errors.transmission}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={formData.location} onValueChange={(value) => handleChange({ name: "location", value })}>
              <SelectTrigger id="location" className={errors.location ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your car in detail. Include condition, history, features, and any other relevant information."
              className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-xs text-gray-500">
              Minimum 20 characters. Recommended 200-300 words for better visibility.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Specifications</CardTitle>
          <CardDescription>Edit more details about your car</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exteriorColor">Exterior Color</Label>
              <Input
                id="exteriorColor"
                name="exteriorColor"
                value={formData.exteriorColor || ""}
                onChange={handleChange}
                placeholder="e.g. Midnight Black Metallic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interiorColor">Interior Color</Label>
              <Input
                id="interiorColor"
                name="interiorColor"
                value={formData.interiorColor || ""}
                onChange={handleChange}
                placeholder="e.g. Black Leather"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN (Optional)</Label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin || ""}
                onChange={handleChange}
                placeholder="e.g. 1HGCV1F34LA123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doors">Doors</Label>
              <Select value={formData.doors || ""} onValueChange={(value) => handleChange({ name: "doors", value })}>
                <SelectTrigger id="doors">
                  <SelectValue placeholder="Select Doors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition || ""}
                onValueChange={(value) => handleChange({ name: "condition", value })}
              >
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Select all features that apply to your car</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {featureOptions.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={(checked) => handleFeatureChange(feature, checked === true)}
                />
                <Label htmlFor={`feature-${feature}`} className="text-sm">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Car Images</CardTitle>
          <CardDescription>Current images of your car</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {carData.images && carData.images.length > 0 ? (
                carData.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Car image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={image?.startsWith("http")}
                    />
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center">
                        Main Image
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No images available</p>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Info className="h-4 w-4 mr-2" />
              <p>
                Note: To change images, please create a new ad. Image editing is not supported in the current version.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Ad...
          </>
        ) : (
          "Update Ad"
        )}
      </Button>
    </form>
  )
}
