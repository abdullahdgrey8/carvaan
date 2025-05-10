import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import CarAd from "@/models/CarAd"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectToDatabase()
    console.log("Connected to MongoDB for initialization")

    // Initialize test user
    await initializeTestUser()

    // Initialize sample car ads
    await initializeSampleCarAds()

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Initialization error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during initialization" }, { status: 500 })
  }
}

async function initializeTestUser() {
  try {
    // Check if test user exists
    const testUser = await User.findOne({ email: "test@example.com" })
    if (!testUser) {
      console.log("Creating test user...")

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash("password123", salt)

      // Create test user
      const newUser = new User({
        fullName: "Test User",
        email: "test@example.com",
        passwordHash,
        phoneNumber: "(123) 456-7890",
        memberSince: "April 2023",
      })

      await newUser.save()
      console.log("Test user created successfully:", newUser._id)
      return newUser
    } else {
      console.log("Test user already exists:", testUser._id)
      return testUser
    }
  } catch (error) {
    console.error("Initialize test user error:", error)
    throw error
  }
}

async function initializeSampleCarAds() {
  try {
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
    throw error
  }
}
