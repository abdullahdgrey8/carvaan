"use client"

import { useSearchParams } from "next/navigation"
import { CarComparison } from "@/components/car-comparison"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ComparePage() {
  const searchParams = useSearchParams()
  const carIdsParam = searchParams.get("carIds")
  const carIds = carIdsParam ? carIdsParam.split(",") : []

  if (carIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Car Comparison</h1>
        <p className="mb-4">No cars selected for comparison.</p>
        <Button asChild>
          <Link href="/browse">Browse Cars</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Car Comparison</h1>
      <CarComparison carIds={carIds} />
    </div>
  )
}
