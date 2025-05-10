"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAds } from "@/components/user-ads"
import Link from "next/link"

export default function MyAdsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const checkAuth = () => {
      const userIdCookie = document.cookie.split("; ").find((row) => row.startsWith("userId="))

      if (!userIdCookie) {
        router.push("/login?redirect=/my-ads")
        return
      }

      const userIdValue = userIdCookie.split("=")[1]
      setUserId(userIdValue)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Car Ads</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Car Ads</CardTitle>
          <Button asChild>
            <Link href="/post-ad">Post New Ad</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <UserAds userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}
