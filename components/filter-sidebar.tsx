"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || 100000),
  ])
  const [yearRange, setYearRange] = useState([
    Number(searchParams.get("minYear") || 2000),
    Number(searchParams.get("maxYear") || new Date().getFullYear()),
  ])

  const [makes, setMakes] = useState<string[]>([])
  const [bodyTypes, setBodyTypes] = useState<string[]>([])
  const [fuelTypes, setFuelTypes] = useState<string[]>([])

  // Initialize checkboxes from URL params
  useEffect(() => {
    // Parse makes from URL
    const makesParam = searchParams.get("makes")
    if (makesParam) {
      setMakes(makesParam.split(","))
    }

    // Parse body types from URL
    const bodyTypesParam = searchParams.get("bodyTypes")
    if (bodyTypesParam) {
      setBodyTypes(bodyTypesParam.split(","))
    }

    // Parse fuel types from URL
    const fuelTypesParam = searchParams.get("fuelTypes")
    if (fuelTypesParam) {
      setFuelTypes(fuelTypesParam.split(","))
    }
  }, [searchParams])

  const makeOptions = [
    { id: "toyota", label: "Toyota" },
    { id: "honda", label: "Honda" },
    { id: "ford", label: "Ford" },
    { id: "bmw", label: "BMW" },
    { id: "mercedes", label: "Mercedes-Benz" },
    { id: "audi", label: "Audi" },
    { id: "tesla", label: "Tesla" },
  ]

  const bodyTypeOptions = [
    { id: "sedan", label: "Sedan" },
    { id: "suv", label: "SUV" },
    { id: "truck", label: "Truck" },
    { id: "coupe", label: "Coupe" },
    { id: "convertible", label: "Convertible" },
    { id: "wagon", label: "Wagon" },
    { id: "hatchback", label: "Hatchback" },
  ]

  const fuelTypeOptions = [
    { id: "gasoline", label: "Gasoline" },
    { id: "diesel", label: "Diesel" },
    { id: "electric", label: "Electric" },
    { id: "hybrid", label: "Hybrid" },
    { id: "plugin_hybrid", label: "Plug-in Hybrid" },
  ]

  const handleMakeChange = (make: string, checked: boolean) => {
    if (checked) {
      setMakes([...makes, make])
    } else {
      setMakes(makes.filter((m) => m !== make))
    }
  }

  const handleBodyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setBodyTypes([...bodyTypes, type])
    } else {
      setBodyTypes(bodyTypes.filter((t) => t !== type))
    }
  }

  const handleFuelTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFuelTypes([...fuelTypes, type])
    } else {
      setFuelTypes(fuelTypes.filter((t) => t !== type))
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Update year range
    params.set("minYear", yearRange[0].toString())
    params.set("maxYear", yearRange[1].toString())

    // Update makes
    if (makes.length > 0) {
      params.set("makes", makes.join(","))
    } else {
      params.delete("makes")
    }

    // Update body types
    if (bodyTypes.length > 0) {
      params.set("bodyTypes", bodyTypes.join(","))
    } else {
      params.delete("bodyTypes")
    }

    // Update fuel types
    if (fuelTypes.length > 0) {
      params.set("fuelTypes", fuelTypes.join(","))
    } else {
      params.delete("fuelTypes")
    }

    router.push(`/browse?${params.toString()}`)
  }

  const resetFilters = () => {
    setPriceRange([0, 100000])
    setYearRange([2000, new Date().getFullYear()])
    setMakes([])
    setBodyTypes([])
    setFuelTypes([])
    router.push("/browse")
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>

      <Accordion type="multiple" defaultValue={["price", "year", "make"]}>
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider value={priceRange} min={0} max={100000} step={1000} onValueChange={setPriceRange} />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="year">
          <AccordionTrigger>Year</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={yearRange}
                min={1990}
                max={new Date().getFullYear()}
                step={1}
                onValueChange={setYearRange}
              />
              <div className="flex justify-between text-sm">
                <span>{yearRange[0]}</span>
                <span>{yearRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="make">
          <AccordionTrigger>Make</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {makeOptions.map((make) => (
                <div key={make.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`make-${make.id}`}
                    checked={makes.includes(make.id)}
                    onCheckedChange={(checked) => handleMakeChange(make.id, checked === true)}
                  />
                  <Label htmlFor={`make-${make.id}`}>{make.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bodyType">
          <AccordionTrigger>Body Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {bodyTypeOptions.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`body-${type.id}`}
                    checked={bodyTypes.includes(type.id)}
                    onCheckedChange={(checked) => handleBodyTypeChange(type.id, checked === true)}
                  />
                  <Label htmlFor={`body-${type.id}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fuelType">
          <AccordionTrigger>Fuel Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {fuelTypeOptions.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fuel-${type.id}`}
                    checked={fuelTypes.includes(type.id)}
                    onCheckedChange={(checked) => handleFuelTypeChange(type.id, checked === true)}
                  />
                  <Label htmlFor={`fuel-${type.id}`}>{type.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-6 space-y-2">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={resetFilters} variant="outline" className="w-full">
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
