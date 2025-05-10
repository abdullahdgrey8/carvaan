import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  { id: "sedan", name: "Sedan", icon: "🚗" },
  { id: "suv", name: "SUV", icon: "🚙" },
  { id: "truck", name: "Truck", icon: "🛻" },
  { id: "convertible", name: "Convertible", icon: "🏎️" },
  { id: "hybrid", name: "Hybrid", icon: "⚡" },
  { id: "electric", name: "Electric", icon: "🔋" },
  { id: "luxury", name: "Luxury", icon: "✨" },
  { id: "classic", name: "Classic", icon: "🏆" },
]

export function CategoryBrowser() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/browse?category=${category.id}`} className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-blue-300">
            <CardContent className="flex flex-col items-center justify-center p-4 h-full">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-center">{category.name}</h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
