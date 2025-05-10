"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PostAdForm } from "@/components/post-ad-form"

export default function PostAdPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in by checking cookies
    const checkAuth = () => {
      const userId = document.cookie.split("; ").find((row) => row.startsWith("userId="))

      if (!userId) {
        router.push("/login?redirect=/post-ad")
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Post a Car Ad</h1>
      <PostAdForm />
    </div>
  )
}
