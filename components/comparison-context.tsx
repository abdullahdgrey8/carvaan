"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ComparisonContextType = {
  comparedCarIds: string[]
  addToComparison: (carId: string) => void
  removeFromComparison: (carId: string) => void
  clearComparison: () => void
  isInComparison: (carId: string) => boolean
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([])

  // Load comparison from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem("carComparison")
    if (savedComparison) {
      try {
        const parsed = JSON.parse(savedComparison)
        if (Array.isArray(parsed)) {
          setComparedCarIds(parsed)
        }
      } catch (error) {
        console.error("Error parsing saved comparison:", error)
      }
    }
  }, [])

  // Save comparison to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("carComparison", JSON.stringify(comparedCarIds))
  }, [comparedCarIds])

  const addToComparison = (carId: string) => {
    if (!comparedCarIds.includes(carId)) {
      setComparedCarIds((prev) => [...prev, carId])
    }
  }

  const removeFromComparison = (carId: string) => {
    setComparedCarIds((prev) => prev.filter((id) => id !== carId))
  }

  const clearComparison = () => {
    setComparedCarIds([])
  }

  const isInComparison = (carId: string) => {
    return comparedCarIds.includes(carId)
  }

  return (
    <ComparisonContext.Provider
      value={{
        comparedCarIds,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return context
}
