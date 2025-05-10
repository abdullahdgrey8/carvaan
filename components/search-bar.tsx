"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function SearchBar() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    query: "",
    make: "",
    priceRange: "",
    year: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }) => {
    const { name, value } = "target" in e ? e.target : e
    setSearchParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (searchParams.query) params.append("query", searchParams.query)
    if (searchParams.make) params.append("make", searchParams.make)
    if (searchParams.priceRange) {
      const [minPrice, maxPrice] = searchParams.priceRange.split("-")
      if (minPrice) params.append("minPrice", minPrice)
      if (maxPrice) params.append("maxPrice", maxPrice)
    }
    if (searchParams.year) {
      const currentYear = new Date().getFullYear()
      if (searchParams.year === "any") {
        // Do nothing
      } else if (searchParams.year === "new") {
        params.append("minYear", (currentYear - 1).toString())
      } else {
        const [minYear, maxYear] = searchParams.year.split("-")
        if (minYear) params.append("minYear", minYear)
        if (maxYear) params.append("maxYear", maxYear)
      }
    }

    router.push(`/browse?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Input
            type="text"
            name="query"
            placeholder="Search by keywords..."
            value={searchParams.query}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div className="md:col-span-1">
          <Select value={searchParams.make} onValueChange={(value) => handleChange({ name: "make", value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="honda">Honda</SelectItem>
              <SelectItem value="ford">Ford</SelectItem>
              <SelectItem value="bmw">BMW</SelectItem>
              <SelectItem value="mercedes">Mercedes</SelectItem>
              <SelectItem value="audi">Audi</SelectItem>
              <SelectItem value="tesla">Tesla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Select
            value={searchParams.priceRange}
            onValueChange={(value) => handleChange({ name: "priceRange", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value="0-5000">Under $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
              <SelectItem value="20000-30000">$20,000 - $30,000</SelectItem>
              <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
              <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
              <SelectItem value="100000-">$100,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}
