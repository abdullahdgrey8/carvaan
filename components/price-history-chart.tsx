"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface PriceHistoryChartProps {
  make: string
  model: string
}

// Generate mock price history data as a fallback
function generateMockPriceHistory(
  make: string,
  model: string,
): { date: string; price: number; minPrice: number; maxPrice: number }[] {
  const data = []
  const today = new Date()
  const basePrice = 20000 + Math.random() * 10000

  for (let i = 0; i < 12; i++) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)

    // Random price fluctuation (±5%)
    const fluctuation = 0.95 + Math.random() * 0.04
    const price = Math.round(basePrice * fluctuation * (1 - i * 0.005))
    const minPrice = Math.round(price * 0.9)
    const maxPrice = Math.round(price * 1.1)

    data.unshift({
      date: date.toISOString().split("T")[0],
      price,
      minPrice,
      maxPrice,
    })
  }

  return data
}

export function PriceHistoryChart({ make, model }: PriceHistoryChartProps) {
  const [priceHistory, setPriceHistory] = useState<
    { date: string; price: number; minPrice: number; maxPrice: number }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<"postgres" | "fallback">("postgres")

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/analytics?type=price-history&make=${make}&model=${model}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch price history: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.priceHistory && data.priceHistory.length > 0) {
          setPriceHistory(data.priceHistory)
          setDataSource("postgres")
        } else {
          // Use mock data if no real data is available
          setPriceHistory(generateMockPriceHistory(make, model))
          setDataSource("fallback")
          setError("No historical data available. Showing simulated data.")
        }
      } catch (error) {
        console.error("Error fetching price history:", error)
        setError("Error loading price history. Using simulated data.")
        // Use mock data as fallback
        setPriceHistory(generateMockPriceHistory(make, model))
        setDataSource("fallback")
      } finally {
        setIsLoading(false)
      }
    }

    if (make && model) {
      fetchPriceHistory()
    }
  }, [make, model])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No price history data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Price History for {make} {model}
          {dataSource === "fallback" && <span className="text-xs text-gray-500 block mt-1">(Simulated data)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            price: {
              label: "Average Price",
              color: "hsl(var(--chart-1))",
            },
            minPrice: {
              label: "Minimum Price",
              color: "hsl(var(--chart-2))",
            },
            maxPrice: {
              label: "Maximum Price",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} domain={["auto", "auto"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                name="Average Price"
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
              {dataSource === "postgres" && (
                <>
                  <Line
                    type="monotone"
                    dataKey="minPrice"
                    stroke="var(--color-minPrice)"
                    name="Minimum Price"
                    dot={{ r: 3 }}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="maxPrice"
                    stroke="var(--color-maxPrice)"
                    name="Maximum Price"
                    dot={{ r: 3 }}
                    strokeDasharray="5 5"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
