import { sql } from "./postgres"

export async function runMigrations() {
  try {
    console.log("Running PostgreSQL migrations...")

    // Create enums
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type') THEN
          CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'other');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission') THEN
          CREATE TYPE transmission AS ENUM ('automatic', 'manual', 'semi_automatic', 'cvt');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'body_type') THEN
          CREATE TYPE body_type AS ENUM ('sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other');
        END IF;
      END $$;
    `

    // Create car_specs table
    await sql`
      CREATE TABLE IF NOT EXISTS car_specs (
        id SERIAL PRIMARY KEY,
        car_id TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        price INTEGER NOT NULL,
        body_type body_type,
        fuel_type fuel_type,
        transmission transmission,
        engine_size DOUBLE PRECISION,
        horsepower INTEGER,
        torque INTEGER,
        fuel_economy DOUBLE PRECISION,
        doors INTEGER,
        seats INTEGER,
        color TEXT,
        interior_color TEXT,
        vin TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `

    // Create price_history table
    await sql`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        average_price INTEGER NOT NULL,
        min_price INTEGER NOT NULL,
        max_price INTEGER NOT NULL,
        sample_size INTEGER NOT NULL
      );
    `

    // Create search_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS search_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        query TEXT NOT NULL,
        filters JSONB,
        result_count INTEGER,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `

    // Create car_views table
    await sql`
      CREATE TABLE IF NOT EXISTS car_views (
        id SERIAL PRIMARY KEY,
        car_id TEXT NOT NULL,
        user_id TEXT,
        view_date TIMESTAMP DEFAULT NOW(),
        session_id TEXT,
        device_type TEXT,
        referrer TEXT
      );
    `

    // Create car_comparisons table
    await sql`
      CREATE TABLE IF NOT EXISTS car_comparisons (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        car_ids TEXT[] NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `

    // Create feature_popularity table
    await sql`
      CREATE TABLE IF NOT EXISTS feature_popularity (
        id SERIAL PRIMARY KEY,
        feature TEXT NOT NULL,
        search_count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
      );
    `

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_car_specs_car_id ON car_specs(car_id);
      CREATE INDEX IF NOT EXISTS idx_car_specs_make_model ON car_specs(make, model);
      CREATE INDEX IF NOT EXISTS idx_price_history_make_model ON price_history(make, model);
      CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
      CREATE INDEX IF NOT EXISTS idx_car_views_car_id ON car_views(car_id);
    `

    console.log("PostgreSQL migrations completed successfully")
  } catch (error) {
    console.error("Error running PostgreSQL migrations:", error)
    throw error
  }
}
