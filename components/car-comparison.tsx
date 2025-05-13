"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useComparison } from "@/components/comparison-context"

interface CarComparisonProps {
  carIds: string[]
}

export function CarComparison({ carIds }: CarComparisonProps) {
  const [specs, setSpecs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { removeFromComparison } = useComparison()

  useEffect(() => {
    const fetchCarSpecs = async () => {
      try {
        if (carIds.length === 0) {
          setSpecs([])
          return
        }

        setIsLoading(true)
        console.log("Fetching car specs for IDs:", carIds)
        const response = await fetch(`/api/compare?carIds=${carIds.join(",")}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch car specs: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          console.log("Received car specs:", data.specs)
          setSpecs(data.specs)
        } else {
          setError(data.error || "Failed to fetch car specs")
          console.error("Failed to fetch car specs:", data.error)
        }
      } catch (error) {
        console.error("Error fetching car specs:", error)
        setError("Error loading car specs. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarSpecs()
  }, [carIds])

  const removeCarFromComparison = (carId: string) => {
    removeFromComparison(carId)

    const newCarIds = carIds.filter((id) => id !== carId)
    if (newCarIds.length === 0) {
      router.push("/browse")
    } else {
      router.push(`/compare?carIds=${newCarIds.join(",")}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading car comparison...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/browse">Browse Cars</Link>
        </Button>
      </div>
    )
  }

  if (specs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cars selected for comparison.</p>
        <Button asChild className="mt-4">
          <Link href="/browse">Browse Cars</Link>
        </Button>
      </div>
    )
  }

  // Define the specs to compare
  const specsToCompare = [
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year" },
    { key: "price", label: "Price", format: (value: number) => `$${value.toLocaleString()}` },
    { key: "mileage", label: "Mileage", format: (value: number) => `${value.toLocaleString()} mi` },
    { key: "bodyType", label: "Body Type" },
    { key: "fuelType", label: "Fuel Type" },
    { key: "transmission", label: "Transmission" },
    { key: "engineSize", label: "Engine Size", format: (value: number) => (value ? `${value}L` : "N/A") },
    { key: "horsepower", label: "Horsepower", format: (value: number) => (value ? `${value} hp` : "N/A") },
    { key: "torque", label: "Torque", format: (value: number) => (value ? `${value} lb-ft` : "N/A") },
    { key: "fuelEconomy", label: "Fuel Economy", format: (value: number) => (value ? `${value} mpg` : "N/A") },
    { key: "doors", label: "Doors" },
    { key: "seats", label: "Seats" },
    { key: "color", label: "Exterior Color" },
    { key: "interiorColor", label: "Interior Color" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Specification</TableHead>
                {specs.map((car) => (
                  <TableHead key={car.carId} className="min-w-[200px]">
                    <div className="flex justify-between items-center">
                      <Link href={`/car/${car.carId}`} className="hover:text-blue-600">
                        {car.make} {car.model}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeCarFromComparison(car.carId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {specsToCompare.map((spec) => (
                <TableRow key={spec.key}>
                  <TableCell className="font-medium">{spec.label}</TableCell>
                  {specs.map((car) => {
                    const value = car[spec.key]
                    const formattedValue = spec.format ? spec.format(value) : value || "N/A"

                    return <TableCell key={`${car.carId}-${spec.key}`}>{formattedValue}</TableCell>
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link href="/browse">Add More Cars</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
