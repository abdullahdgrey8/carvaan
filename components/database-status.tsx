"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<{
    mongodb: boolean
    redis: boolean
    postgres: boolean
  }>({
    mongodb: false,
    redis: false,
    postgres: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        setIsLoading(true)

        // Check MongoDB
        const mongoResponse = await fetch("/api/mongodb/status")
        const mongoData = await mongoResponse.json()

        // Check Redis
        const redisResponse = await fetch("/api/redis/status")
        const redisData = await redisResponse.json()

        // Check PostgreSQL
        const postgresResponse = await fetch("/api/postgres/status")
        const postgresData = await postgresResponse.json()

        setStatus({
          mongodb: mongoData.connected,
          redis: redisData.connected,
          postgres: postgresData.connected,
        })
      } catch (error) {
        console.error("Error checking database status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabaseStatus()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
          <CardDescription>Checking connection status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
        <CardDescription>Current connection status of databases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">MongoDB</span>
            <Badge variant={status.mongodb ? "default" : "destructive"}>
              {status.mongodb ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Redis</span>
            <Badge variant={status.redis ? "default" : "destructive"}>
              {status.redis ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">PostgreSQL</span>
            <Badge variant={status.postgres ? "default" : "destructive"}>
              {status.postgres ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
