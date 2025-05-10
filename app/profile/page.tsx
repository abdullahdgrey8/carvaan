"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile-form"
import { UserAds } from "@/components/user-ads"
import { FavoritesTab } from "./favorites-tab"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const checkAuth = () => {
      const userId = document.cookie.split("; ").find((row) => row.startsWith("userId="))

      if (!userId) {
        router.push("/login?redirect=/profile")
        return
      }

      const userIdValue = userId.split("=")[1]

      // Get user profile from API
      fetch(`/api/user/profile?userId=${userIdValue}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setProfile(data.user)
          } else {
            router.push("/login?redirect=/profile")
          }
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching profile:", error)
          router.push("/login?redirect=/profile")
        })
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ads">My Ads</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{profile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profile.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{profile.memberSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm profile={profile} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Car Ads</CardTitle>
              <Button asChild>
                <Link href="/post-ad">Post New Ad</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <UserAds userId={profile.userId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <FavoritesTab userId={profile.userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
