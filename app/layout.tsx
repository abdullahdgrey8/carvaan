import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"

const metadata: Metadata = {
  title: "CarMarket - Buy & Sell Cars",
  description: "Find your perfect car or sell your vehicle with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'