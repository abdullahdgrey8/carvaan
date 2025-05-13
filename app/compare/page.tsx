"use client"

import { useSearchParams } from "next/navigation"
import { CarComparison } from "@/components/car-comparison"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useComparison } from "@/components/comparison-context"

export default function ComparePage() {
  const searchParams = useSearchParams()
  const carIdsParam = searchParams.get("carIds")

  // Get car IDs from URL parameters
  const urlCarIds = carIdsParam ? carIdsParam.split(",").filter((id) => id.trim() !== "") : []

  // Get comparison context
  const { comparedCarIds } = useComparison()

  // Use URL parameters if available, otherwise use context
  const carIds = urlCarIds.length > 0 ? urlCarIds : comparedCarIds

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
      <h1 className="text-2xl font-bold mb-6">Car Comparison ({carIds.length} cars)</h1>
      <CarComparison carIds={carIds} />
    </div>
  )
}
