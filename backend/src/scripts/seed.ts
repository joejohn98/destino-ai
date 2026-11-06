/**
 * Seed Script — Destino AI
 *
 * Creates sample Continents, Countries, Destinations, Users and Reviews.
 * Run with:  npm run seed
 *
 * ⚠️  This will DROP existing data before inserting fresh data.
 *     Do NOT run against production.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import { Continent } from "../models/Continent.model";
import { Country } from "../models/Country.model";
import { Destination } from "../models/Destination.model";
import { User } from "../models/User.model";
import { Review } from "../models/Review.model";
import { normalizeSearchValue } from "../utils/search-normalization";

// Data Fixtures
import { continentsData } from "./seed-data/continents.data";
import { getCountriesSeedData } from "./seed-data/countries.data";
import { getUsersSeedData } from "./seed-data/users.data";
import { getDestinationsSeedData } from "./seed-data/destinations.data";
import { getReviewsSeedData } from "./seed-data/reviews.data";

const seed = async () => {
  try {
    if (config.nodeEnv === "production") {
      throw new Error("Seeding is disabled in production.");
    }
    if (process.env.SEED_ALLOW_DESTRUCTIVE !== "1") {
      throw new Error(
        "Seeding deletes all existing data. Set SEED_ALLOW_DESTRUCTIVE=1 to continue.",
      );
    }

    console.log("🔌  Connecting to MongoDB...");
    await mongoose.connect(config.mongodbURI);
    console.log("✅  Connected to MongoDB");

    // ── Wipe ──────────────────────────────────────────────────────────────────
    console.log("🗑️   Clearing existing data...");
    await Promise.all([
      Continent.deleteMany({}),
      Country.deleteMany({}),
      Destination.deleteMany({}),
      User.deleteMany({}),
      Review.deleteMany({}),
    ]);
    await Promise.all([User.syncIndexes(), Review.syncIndexes()]);
    console.log("✅  Collections cleared & indexes synced");

    // ── 1. Continents ─────────────────────────────────────────────────────────
    console.log("🌍  Seeding Continents...");
    const continents = await Continent.insertMany(continentsData);

    const continentMap = new Map<string, mongoose.Types.ObjectId>();
    continents.forEach((c) =>
      continentMap.set(c.name, c._id as mongoose.Types.ObjectId),
    );
    console.log(`   → ${continents.length} continents inserted`);

    // ── 2. Countries ──────────────────────────────────────────────────────────
    console.log("🏳️   Seeding Countries...");
    const countriesData = getCountriesSeedData(continentMap);
    const countries = await Country.insertMany(
      countriesData.map((country) => ({
        ...country,
        searchName: normalizeSearchValue(country.name),
      })),
    );

    const countryMap = new Map<string, mongoose.Types.ObjectId>();
    countries.forEach((c) =>
      countryMap.set(c.name, c._id as mongoose.Types.ObjectId),
    );
    console.log(`   → ${countries.length} countries inserted`);

    // ── 3. Users ──────────────────────────────────────────────────────────────
    console.log("👤  Seeding Users...");
    const hashedPassword = await bcrypt.hash("Password123!", 12);
    const usersData = getUsersSeedData(hashedPassword);
    const users = await User.insertMany(usersData);
    console.log(`   → ${users.length} users inserted`);

    // ── 4. Destinations ───────────────────────────────────────────────────────
    console.log("📍  Seeding Destinations...");
    const destinationsData = getDestinationsSeedData(countryMap);
    const destinations = await Destination.insertMany(
      destinationsData.map((destination) => ({
        ...destination,
        searchCity: normalizeSearchValue(destination.location.city),
      })),
    );
    console.log(`   → ${destinations.length} destinations inserted`);

    // ── 5. Reviews ────────────────────────────────────────────────────────────
    console.log("⭐  Seeding Reviews...");
    const validReviews = getReviewsSeedData(destinations, users);
    await Review.insertMany(validReviews);
    console.log(`   → ${validReviews.length} reviews inserted`);

    // ── Done ──────────────────────────────────────────────────────────────────
    console.log("\n🎉  Seed complete!\n");
    console.log("─────────────────────────────────────────────────────────");
    console.log("  Test credentials (all passwords: Password123!)");
    console.log("─────────────────────────────────────────────────────────");
    console.log("  Admin  → admin@destino.ai");
    console.log("  User 1 → john@example.com");
    console.log("  User 2 → sarah@example.com");
    console.log("─────────────────────────────────────────────────────────\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌  Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
