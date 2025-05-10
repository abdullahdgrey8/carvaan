import { Check } from "lucide-react"

interface CarFeaturesListProps {
  features: string[]
}

export function CarFeaturesList({ features }: CarFeaturesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center">
          <Check className="h-4 w-4 text-green-500 mr-2" />
          <span>{feature}</span>
        </div>
      ))}
    </div>
  )
}
