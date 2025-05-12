import { Button } from "@/components/ui/button"
import { FeaturedCars } from "@/components/featured-cars"
import { PopularCars } from "@/components/popular-cars"
import { CategoryBrowser } from "@/components/category-browser"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative rounded-lg overflow-hidden mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 md:p-16 rounded-lg">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Perfect Car Today</h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse thousands of listings from verified sellers across the country
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/browse">Browse Cars</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-blue-700/50">
                <Link href="/post-ad">Sell Your Car</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-12">
        <SearchBar />
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <CategoryBrowser />
      </section>

      {/* Featured Cars Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Cars</h2>
        <FeaturedCars />
      </section>

      {/* Popular Cars Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Most Viewed Cars</h2>
        <PopularCars />
      </section>
    </div>
  )
}
