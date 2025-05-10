"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CarImageGalleryProps {
  images: string[]
}

export function CarImageGallery({ images }: CarImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <>
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
            alt={`Car image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            priority
          />

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous image</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next image</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
            onClick={() => setIsFullscreenOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">View fullscreen</span>
          </Button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden ${
                index === currentImageIndex ? "ring-2 ring-blue-600" : "opacity-70"
              }`}
            >
              <Image
                src={image || "/placeholder.svg?height=100&width=150"}
                alt={`Car thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="relative h-[80vh]">
            <Image
              src={images[currentImageIndex] || "/placeholder.svg?height=800&width=1200"}
              alt={`Car image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full h-10 w-10 text-white"
              onClick={() => {
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous image</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full h-10 w-10 text-white"
              onClick={() => {
                goToNext()
              }}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
