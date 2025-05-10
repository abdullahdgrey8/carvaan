"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface MapLocationProps {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
}

export function MapLocation({ location, coordinates }: MapLocationProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real app, you would use a mapping library like Google Maps or Mapbox
    // For this example, we'll just show a placeholder
    if (mapRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = mapRef.current.clientWidth
      canvas.height = mapRef.current.clientHeight
      mapRef.current.appendChild(canvas)

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw a simple map placeholder
        ctx.fillStyle = "#e5e7eb"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI)
        ctx.fill()

        ctx.font = "14px Arial"
        ctx.fillStyle = "#1f2937"
        ctx.textAlign = "center"
        ctx.fillText(location, canvas.width / 2, canvas.height / 2 + 30)

        ctx.font = "12px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.fillText(
          `Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`,
          canvas.width / 2,
          canvas.height / 2 + 50,
        )
      }
    }

    return () => {
      if (mapRef.current) {
        while (mapRef.current.firstChild) {
          mapRef.current.removeChild(mapRef.current.firstChild)
        }
      }
    }
  }, [location, coordinates])

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="h-64 w-full bg-gray-100"></div>
    </Card>
  )
}
