"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Star, Shield, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface SellerContactCardProps {
  seller: {
    name: string
    phone: string
    email: string
    rating: number
    memberSince: string
  }
  onContactClick?: () => void
}

export function SellerContactCard({ seller, onContactClick }: SellerContactCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4">Seller Information</h3>
        <div className="mb-4">
          <p className="font-medium text-lg">{seller.name}</p>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{seller.rating} rating</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Member since {seller.memberSince}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={onContactClick}>
            <Phone className="h-4 w-4 mr-2" />
            {seller.phone}
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={onContactClick}>
            <Mail className="h-4 w-4 mr-2" />
            {seller.email}
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center text-sm text-gray-600">
          <Shield className="h-4 w-4 text-blue-500 mr-2" />
          <span>Verified Seller</span>
        </div>
      </CardContent>
    </Card>
  )
}
