"use server"

import { connectToDatabase } from "./mongodb"
import CarAd from "@/models/CarAd"
import User from "@/models/User"
import Favorite from "@/models/Favorite"
import mongoose from "mongoose"
import { getUserSession } from "./auth"

// Create car ad
export async function createCarAd(
  formData: {
    title: string
    make: string
    model: string
    year: string
    price: string
    mileage: string
    description: string
    bodyType: string
    fuelType: string
    transmission: string
    features?: string[]
    location: string
    exteriorColor?: string
    interiorColor?: string
    vin?: string
    doors?: string
    condition?: string
  },
  images: File[],
) {
  try {
    console.log("Creating car ad...")

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { success: false, error: "You must be logged in to post an ad" }
    }

    await connectToDatabase()

    // Get user info
    const user = await User.findById(session.userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // In a real app, you would upload images to a storage service like AWS S3 or Vercel Blob
    // For this example, we'll use placeholder images
    const imageUrls = Array(images.length).fill("/placeholder.svg?height=400&width=600")

    // Create new car ad
    const newAd = new CarAd({
      userId: session.userId,
      title: formData.title,
      make: formData.make,
      model: formData.model,
      year: Number.parseInt(formData.year),
      price: Number.parseFloat(formData.price),
      mileage: Number.parseInt(formData.mileage),
      description: formData.description,
      bodyType: formData.bodyType,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      features: formData.features || [],
      location: formData.location,
      images: imageUrls,
      status: "active",
      views: 0,
      specifications: {
        engine: "Not specified",
        transmission: formData.transmission,
        drivetrain: "Not specified",
        fuelEconomy: "Not specified",
        exteriorColor: formData.exteriorColor || "Not specified",
        interiorColor: formData.interiorColor || "Not specified",
        vin: formData.vin || "Not specified",
        doors: formData.doors || "Not specified",
        condition: formData.condition || "Not specified",
      },
      seller: {
        name: user.fullName,
        phone: user.phoneNumber,
        email: user.email,
        rating: 5.0,
        memberSince: user.memberSince,
      },
      coordinates: {
        lat: 47.6062,
        lng: -122.3321,
      },
    })

    await newAd.save()
    console.log("Car ad created successfully:", newAd._id)

    return { success: true, adId: newAd._id }
  } catch (error) {
    console.error("Create car ad error:", error)
    return { success: false, error: "An error occurred while creating your ad" }
  }
}

// Get car ad
export async function getCarAd(id: string) {
  try {
    console.log("Getting car ad:", id)
    await connectToDatabase()

    // Validate id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid car ad ID")
      return null
    }

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      console.log("Car ad not found")
      return null
    }

    // Increment views
    carAd.views += 1
    await carAd.save()
    console.log("Car ad views incremented to:", carAd.views)

    return carAd.toObject()
  } catch (error) {
    console.error("Get car ad error:", error)
    return null
  }
}

// Get user car ads
export async function getUserCarAds(userId: string) {
  try {
    console.log("Getting car ads for user:", userId)
    await connectToDatabase()

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID")
      return []
    }

    // Find car ads
    const userAds = await CarAd.find({ userId }).sort({ createdAt: -1 })
    console.log(`Found ${userAds.length} car ads for user`)

    return userAds.map((ad) => ad.toObject())
  } catch (error) {
    console.error("Get user car ads error:", error)
    return []
  }
}

// Update car ad
export async function updateCarAd(
  id: string,
  formData: {
    title: string
    make: string
    model: string
    year: string
    price: string
    mileage: string
    description: string
    bodyType: string
    fuelType: string
    transmission: string
    features?: string[]
    location: string
    exteriorColor?: string
    interiorColor?: string
    vin?: string
    doors?: string
    condition?: string
  },
) {
  try {
    console.log("Updating car ad:", id)

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { success: false, error: "You must be logged in to update an ad" }
    }

    await connectToDatabase()

    // Validate id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid car ad ID" }
    }

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      return { success: false, error: "Car ad not found" }
    }

    // Check if user owns the ad
    if (carAd.userId.toString() !== session.userId) {
      return { success: false, error: "You do not have permission to update this ad" }
    }

    // Update car ad
    carAd.title = formData.title
    carAd.make = formData.make
    carAd.model = formData.model
    carAd.year = Number.parseInt(formData.year)
    carAd.price = Number.parseFloat(formData.price)
    carAd.mileage = Number.parseInt(formData.mileage)
    carAd.description = formData.description
    carAd.bodyType = formData.bodyType
    carAd.fuelType = formData.fuelType
    carAd.transmission = formData.transmission
    carAd.features = formData.features || []
    carAd.location = formData.location
    carAd.specifications.transmission = formData.transmission

    if (formData.exteriorColor) carAd.specifications.exteriorColor = formData.exteriorColor
    if (formData.interiorColor) carAd.specifications.interiorColor = formData.interiorColor
    if (formData.vin) carAd.specifications.vin = formData.vin
    if (formData.doors) carAd.specifications.doors = formData.doors
    if (formData.condition) carAd.specifications.condition = formData.condition

    await carAd.save()
    console.log("Car ad updated successfully")

    return { success: true }
  } catch (error) {
    console.error("Update car ad error:", error)
    return { success: false, error: "An error occurred while updating your ad" }
  }
}

// Delete car ad
export async function deleteCarAd(id: string) {
  try {
    console.log("Deleting car ad:", id)

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { success: false, error: "You must be logged in to delete an ad" }
    }

    await connectToDatabase()

    // Validate id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid car ad ID" }
    }

    // Find car ad
    const carAd = await CarAd.findById(id)
    if (!carAd) {
      return { success: false, error: "Car ad not found" }
    }

    // Check if user owns the ad
    if (carAd.userId.toString() !== session.userId) {
      return { success: false, error: "You do not have permission to delete this ad" }
    }

    // Delete car ad
    await CarAd.findByIdAndDelete(id)
    console.log("Car ad deleted successfully")

    // Delete any favorites associated with this ad
    await Favorite.deleteMany({ carAdId: id })
    console.log("Associated favorites deleted")

    return { success: true }
  } catch (error) {
    console.error("Delete car ad error:", error)
    return { success: false, error: "An error occurred while deleting your ad" }
  }
}

// Get featured car ads for homepage
export async function getFeaturedCarAds() {
  try {
    console.log("Getting featured car ads")
    await connectToDatabase()

    // Find featured car ads (in a real app, you might have a featured field)
    const featuredAds = await CarAd.find({ status: "active" }).sort({ views: -1 }).limit(4)
    console.log(`Found ${featuredAds.length} featured car ads`)

    return featuredAds.map((ad) => ({
      id: ad._id.toString(),
      title: ad.title,
      price: ad.price,
      location: ad.location,
      year: ad.year,
      mileage: ad.mileage,
      image: ad.images[0] || "/placeholder.svg?height=200&width=300",
      featured: true,
    }))
  } catch (error) {
    console.error("Get featured car ads error:", error)
    return []
  }
}

// Search car ads
export async function searchCarAds(params: { [key: string]: string | string[] | undefined }) {
  try {
    console.log("Searching car ads with params:", params)
    await connectToDatabase()

    // Build query
    const query: any = { status: "active" }

    // Filter by query
    if (params.query) {
      const searchQuery = params.query.toString().toLowerCase()
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { make: { $regex: searchQuery, $options: "i" } },
        { model: { $regex: searchQuery, $options: "i" } },
      ]
    }

    // Filter by make
    if (params.make && params.make !== "all") {
      query.make = params.make
    }

    // Filter by category/body type
    if (params.category) {
      query.bodyType = params.category
    }

    // Filter by price range
    if (params.minPrice || params.maxPrice) {
      query.price = {}
      if (params.minPrice) query.price.$gte = Number(params.minPrice)
      if (params.maxPrice) query.price.$lte = Number(params.maxPrice)
    }

    // Filter by year range
    if (params.minYear || params.maxYear) {
      query.year = {}
      if (params.minYear) query.year.$gte = Number(params.minYear)
      if (params.maxYear) query.year.$lte = Number(params.maxYear)
    }

    // Filter by makes (comma-separated list)
    if (params.makes) {
      const makesList = typeof params.makes === "string" ? params.makes.split(",") : params.makes
      query.make = { $in: makesList }
    }

    // Filter by body types (comma-separated list)
    if (params.bodyTypes) {
      const bodyTypesList = typeof params.bodyTypes === "string" ? params.bodyTypes.split(",") : params.bodyTypes
      query.bodyType = { $in: bodyTypesList }
    }

    // Filter by fuel types (comma-separated list)
    if (params.fuelTypes) {
      const fuelTypesList = typeof params.fuelTypes === "string" ? params.fuelTypes.split(",") : params.fuelTypes
      query.fuelType = { $in: fuelTypesList }
    }

    // Execute query
    const carAds = await CarAd.find(query).sort({ createdAt: -1 })
    console.log(`Found ${carAds.length} car ads matching search criteria`)

    return carAds.map((ad) => ({
      id: ad._id.toString(),
      title: ad.title,
      price: ad.price,
      location: ad.location,
      year: ad.year,
      mileage: ad.mileage,
      image: ad.images[0] || "/placeholder.svg?height=200&width=300",
      featured: false,
    }))
  } catch (error) {
    console.error("Search car ads error:", error)
    return []
  }
}

// Get similar car ads
export async function getSimilarCarAds(carId: string) {
  try {
    console.log("Getting similar car ads for:", carId)
    await connectToDatabase()

    // Validate carId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      console.log("Invalid car ad ID")
      return []
    }

    // Find the current car
    const currentCar = await CarAd.findById(carId)
    if (!currentCar) {
      console.log("Car ad not found")
      return []
    }

    // Find similar cars based on make, model, or price range
    const similarCars = await CarAd.find({
      _id: { $ne: carId },
      status: "active",
      $or: [
        { make: currentCar.make },
        {
          price: {
            $gte: currentCar.price * 0.8,
            $lte: currentCar.price * 1.2,
          },
        },
        { bodyType: currentCar.bodyType },
      ],
    }).limit(3)

    console.log(`Found ${similarCars.length} similar car ads`)

    return similarCars.map((car) => ({
      id: car._id.toString(),
      title: car.title,
      price: car.price,
      location: car.location,
      image: car.images[0] || "/placeholder.svg?height=150&width=250",
    }))
  } catch (error) {
    console.error("Get similar car ads error:", error)
    return []
  }
}

// Add car to favorites
export async function addToFavorites(carId: string) {
  try {
    console.log("Adding car to favorites:", carId)

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { success: false, error: "You must be logged in to add to favorites" }
    }

    await connectToDatabase()

    // Validate carId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return { success: false, error: "Invalid car ad ID" }
    }

    // Check if car exists
    const carExists = await CarAd.exists({ _id: carId })
    if (!carExists) {
      return { success: false, error: "Car ad not found" }
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: session.userId,
      carAdId: carId,
    })

    if (existingFavorite) {
      return { success: false, error: "Car is already in favorites" }
    }

    // Add to favorites
    const favorite = new Favorite({
      userId: session.userId,
      carAdId: carId,
    })

    await favorite.save()
    console.log("Car added to favorites successfully")

    return { success: true }
  } catch (error) {
    console.error("Add to favorites error:", error)
    return { success: false, error: "An error occurred while adding to favorites" }
  }
}

// Remove car from favorites
export async function removeFromFavorites(carId: string) {
  try {
    console.log("Removing car from favorites:", carId)

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { success: false, error: "You must be logged in to remove from favorites" }
    }

    await connectToDatabase()

    // Validate carId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return { success: false, error: "Invalid car ad ID" }
    }

    // Remove from favorites
    const result = await Favorite.findOneAndDelete({
      userId: session.userId,
      carAdId: carId,
    })

    if (!result) {
      return { success: false, error: "Car was not in favorites" }
    }

    console.log("Car removed from favorites successfully")
    return { success: true }
  } catch (error) {
    console.error("Remove from favorites error:", error)
    return { success: false, error: "An error occurred while removing from favorites" }
  }
}

// Check if car is in favorites
export async function isCarInFavorites(carId: string) {
  try {
    console.log("Checking if car is in favorites:", carId)

    // Check if user is logged in
    const session = await getUserSession()
    if (!session) {
      return { isFavorite: false }
    }

    await connectToDatabase()

    // Validate carId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return { isFavorite: false }
    }

    // Check if in favorites
    const favorite = await Favorite.findOne({
      userId: session.userId,
      carAdId: carId,
    })

    console.log("Car in favorites:", !!favorite)
    return { isFavorite: !!favorite }
  } catch (error) {
    console.error("Check favorites error:", error)
    return { isFavorite: false }
  }
}

// Get user favorites
export async function getUserFavorites(userId: string) {
  try {
    console.log("Getting favorites for user:", userId)
    await connectToDatabase()

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID")
      return []
    }

    // Find favorites
    const favorites = await Favorite.find({ userId }).populate("carAdId")
    console.log(`Found ${favorites.length} favorites`)

    // Map to car ads
    return favorites
      .filter((fav) => fav.carAdId) // Filter out any null references
      .map((fav) => {
        const car = fav.carAdId as any
        return {
          id: car._id,
          title: car.title,
          price: car.price,
          location: car.location,
          year: car.year,
          mileage: car.mileage,
          image: car.images[0] || "/placeholder.svg?height=200&width=300",
        }
      })
  } catch (error) {
    console.error("Get user favorites error:", error)
    return []
  }
}

// Initialize with sample car ads
export async function initializeSampleCarAds() {
  try {
    await connectToDatabase()

    // Check if we already have car ads
    const count = await CarAd.countDocuments()
    if (count > 0) {
      console.log(`${count} car ads already exist, skipping initialization`)
      return
    }

    console.log("Initializing sample car ads...")

    // Get test user
    const testUser = await User.findOne({ email: "test@example.com" })
    if (!testUser) {
      console.log("Test user not found, cannot initialize sample car ads")
      return
    }

    const sampleCarAds = [
      {
        userId: testUser._id,
        title: "2022 Toyota Camry XSE V6 - Low Miles, Fully Loaded",
        make: "toyota",
        model: "Camry",
        year: 2022,
        price: 28500,
        mileage: 15000,
        description:
          "This beautiful Toyota Camry XSE is in excellent condition with low mileage. It features a powerful V6 engine, leather interior, panoramic sunroof, and all the latest tech including Apple CarPlay and Android Auto integration. The car has been meticulously maintained and comes with a full service history. The exterior is finished in a stunning Midnight Black Metallic paint that looks amazing in any light. Inside, you'll find premium red leather seats that are both heated and ventilated, a JBL premium sound system, and a large touchscreen display with navigation. Safety features include blind spot monitoring, lane departure warning, adaptive cruise control, and a 360-degree camera system. This car truly has it all and drives like a dream. Perfect for daily commuting or weekend getaways.",
        bodyType: "sedan",
        fuelType: "gasoline",
        transmission: "automatic",
        features: [
          "Leather Seats",
          "Navigation System",
          "Bluetooth",
          "Backup Camera",
          "Sunroof/Moonroof",
          "Heated Seats",
          "Remote Start",
          "Keyless Entry",
          "Blind Spot Monitoring",
          "Lane Departure Warning",
          "Apple CarPlay/Android Auto",
          "Premium Sound System",
          "Adaptive Cruise Control",
          "Parking Sensors",
          "360-degree Camera",
        ],
        location: "Seattle, WA",
        images: [
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
        ],
        status: "active",
        views: 124,
        specifications: {
          engine: "3.5L V6",
          transmission: "8-Speed Automatic",
          drivetrain: "Front-Wheel Drive",
          fuelEconomy: "22 City / 33 Highway",
          exteriorColor: "Midnight Black Metallic",
          interiorColor: "Red Leather",
          vin: "4T1BZ1HK5NU123456",
          doors: "4",
          condition: "Excellent",
        },
        seller: {
          name: testUser.fullName,
          phone: testUser.phoneNumber,
          email: testUser.email,
          rating: 4.8,
          memberSince: testUser.memberSince,
        },
        coordinates: {
          lat: 47.6062,
          lng: -122.3321,
        },
      },
      {
        userId: testUser._id,
        title: "2020 Honda Accord Sport 2.0T - One Owner, Clean Title",
        make: "honda",
        model: "Accord",
        year: 2020,
        price: 24900,
        mileage: 28000,
        description:
          "This 2020 Honda Accord Sport is a fantastic sedan with a sleek design and excellent performance. It features a turbocharged 2.0L engine producing 252 horsepower, sport-tuned suspension, and a comfortable interior with all the modern amenities you'd expect. The car has been well-maintained with regular service at the Honda dealership and is in great condition. Features include heated leather seats, a power moonroof, wireless phone charging, and Honda Sensing safety suite. The Modern Steel Metallic exterior is paired with a black leather interior that gives this Accord a premium feel. This is a one-owner vehicle with a clean title and no accidents. Perfect for someone looking for a reliable, sporty sedan with excellent fuel economy.",
        bodyType: "sedan",
        fuelType: "gasoline",
        transmission: "automatic",
        features: [
          "Bluetooth",
          "Backup Camera",
          "Apple CarPlay/Android Auto",
          "Lane Keeping Assist",
          "Adaptive Cruise Control",
          "Heated Seats",
          "Keyless Entry",
          "Push Button Start",
          "Wireless Phone Charging",
          "Power Moonroof",
          "LED Headlights",
          "19-inch Alloy Wheels",
          "Dual-Zone Climate Control",
        ],
        location: "Portland, OR",
        images: [
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
        ],
        status: "active",
        views: 87,
        specifications: {
          engine: "2.0L Turbocharged 4-Cylinder",
          transmission: "10-Speed Automatic",
          drivetrain: "Front-Wheel Drive",
          fuelEconomy: "22 City / 32 Highway",
          exteriorColor: "Modern Steel Metallic",
          interiorColor: "Black Leather",
          vin: "1HGCV2F34LA123456",
          doors: "4",
          condition: "Very Good",
        },
        seller: {
          name: testUser.fullName,
          phone: testUser.phoneNumber,
          email: testUser.email,
          rating: 4.5,
          memberSince: testUser.memberSince,
        },
        coordinates: {
          lat: 45.5152,
          lng: -122.6784,
        },
      },
      {
        userId: testUser._id,
        title: "2021 Tesla Model 3 Long Range - Autopilot, Premium Interior",
        make: "tesla",
        model: "Model 3",
        year: 2021,
        price: 39800,
        mileage: 12000,
        description:
          "This 2021 Tesla Model 3 Long Range is in pristine condition with low mileage. It features Autopilot, a premium interior, and excellent range of 353 miles on a full charge. The car is incredibly efficient and fun to drive, with instant acceleration (0-60 in 4.2 seconds) and responsive handling. The Pearl White Multi-Coat exterior is paired with a black vegan leather interior and wood trim. Features include a panoramic glass roof, premium audio system with immersive sound, heated front and rear seats, and Tesla's renowned Autopilot system with Navigate on Autopilot capability. The car has been garage-kept and meticulously maintained. Includes Tesla Wall Connector for home charging (installation not included). This Model 3 is still under Tesla's factory warranty and has free unlimited Supercharging.",
        bodyType: "sedan",
        fuelType: "electric",
        transmission: "automatic",
        features: [
          "Autopilot",
          "Premium Interior",
          "Glass Roof",
          "Heated Seats",
          "Navigation",
          "Premium Sound System",
          "Keyless Entry",
          "Supercharging Capability",
          "Sentry Mode",
          "Dog Mode",
          "Camp Mode",
          "Over-the-air Updates",
          "15-inch Touchscreen",
          "Wireless Phone Charging",
        ],
        location: "San Francisco, CA",
        images: [
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
          "/placeholder.svg?height=400&width=600",
        ],
        status: "active",
        views: 156,
        specifications: {
          engine: "Dual Electric Motors",
          transmission: "Single-Speed",
          drivetrain: "All-Wheel Drive",
          fuelEconomy: "134 MPGe",
          exteriorColor: "Pearl White Multi-Coat",
          interiorColor: "Black",
          vin: "5YJ3E1EA1MF123456",
          doors: "4",
          condition: "Excellent",
          range: "353 miles",
          batterySize: "82 kWh",
          chargingSpeed: "250 kW",
        },
        seller: {
          name: testUser.fullName,
          phone: testUser.phoneNumber,
          email: testUser.email,
          rating: 4.9,
          memberSince: testUser.memberSince,
        },
        coordinates: {
          lat: 37.7749,
          lng: -122.4194,
        },
      },
    ]

    // Insert sample car ads
    await CarAd.insertMany(sampleCarAds)
    console.log(`${sampleCarAds.length} sample car ads created successfully`)
  } catch (error) {
    console.error("Initialize sample car ads error:", error)
  }
}
