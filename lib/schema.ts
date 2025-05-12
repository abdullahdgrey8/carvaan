import { pgTable, serial, text, integer, timestamp, doublePrecision, pgEnum, json } from "drizzle-orm/pg-core"

// Enums
export const fuelTypeEnum = pgEnum("fuel_type", ["gasoline", "diesel", "electric", "hybrid", "plugin_hybrid", "other"])
export const transmissionEnum = pgEnum("transmission", ["automatic", "manual", "semi_automatic", "cvt"])
export const bodyTypeEnum = pgEnum("body_type", [
  "sedan",
  "suv",
  "hatchback",
  "coupe",
  "convertible",
  "wagon",
  "van",
  "truck",
  "other",
])

// Car specifications table - optimized for columnar storage and filtering
export const carSpecs = pgTable("car_specs", {
  id: serial("id").primaryKey(),
  carId: text("car_id").notNull(), // MongoDB ID reference
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  price: integer("price").notNull(),
  bodyType: bodyTypeEnum("body_type"),
  fuelType: fuelTypeEnum("fuel_type"),
  transmission: transmissionEnum("transmission"),
  engineSize: doublePrecision("engine_size"),
  horsepower: integer("horsepower"),
  torque: integer("torque"),
  fuelEconomy: doublePrecision("fuel_economy"),
  doors: integer("doors"),
  seats: integer("seats"),
  color: text("color"),
  interiorColor: text("interior_color"),
  vin: text("vin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Price history table - optimized for time-series data
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  date: timestamp("date").notNull(),
  averagePrice: integer("average_price").notNull(),
  minPrice: integer("min_price").notNull(),
  maxPrice: integer("max_price").notNull(),
  sampleSize: integer("sample_size").notNull(),
})

// Search logs table - for analytics
export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  query: text("query").notNull(),
  filters: json("filters"),
  resultCount: integer("result_count"),
  timestamp: timestamp("timestamp").defaultNow(),
})

// Car views analytics table
export const carViews = pgTable("car_views", {
  id: serial("id").primaryKey(),
  carId: text("car_id").notNull(),
  userId: text("user_id"),
  viewDate: timestamp("view_date").defaultNow(),
  sessionId: text("session_id"),
  deviceType: text("device_type"),
  referrer: text("referrer"),
})

// Car comparisons table
export const carComparisons = pgTable("car_comparisons", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  carIds: text("car_ids").array().notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
})

// Feature popularity table - track which features users search for most
export const featurePopularity = pgTable("feature_popularity", {
  id: serial("id").primaryKey(),
  feature: text("feature").notNull(),
  searchCount: integer("search_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
})
