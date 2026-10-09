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
import { Destination, type Category } from "../models/Destination.model";
import { User } from "../models/User.model";
import { Review } from "../models/Review.model";

const seed = async () => {
  try {
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
    const continentsData = [
      {
        name: "Africa",
        description: "The birthplace of humanity, home to breathtaking wildlife and ancient civilizations.",
        imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
      },
      {
        name: "Asia",
        description: "The world's largest continent, a seamless blend of ancient tradition and modern innovation.",
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      },
      {
        name: "Europe",
        description: "A mosaic of cultures, history and architecture spanning thousands of years.",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
      },
      {
        name: "North America",
        description: "A continent of stunning diversity, from tropical beaches to arctic tundra.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      },
      {
        name: "Oceania",
        description: "A vast region of islands and coral reefs, home to unique wildlife and ancient cultures.",
        imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be",
      },
    ];
    const continents = await Continent.insertMany(continentsData);

    const continentMap = new Map<string, mongoose.Types.ObjectId>();
    continents.forEach((c) => continentMap.set(c.name, c._id as mongoose.Types.ObjectId));
    console.log(`   → ${continents.length} continents inserted`);

    // ── 2. Countries ──────────────────────────────────────────────────────────
    console.log("🏳️   Seeding Countries...");
    const countriesData = [
      {
        name: "Egypt",
        description: "Land of pharaohs, pyramids and the mighty Nile River.",
        imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368",
        continent: continentMap.get("Africa"),
      },
      {
        name: "Kenya",
        description: "Home of the Great Migration and the Big Five.",
        imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801",
        continent: continentMap.get("Africa"),
      },
      {
        name: "India",
        description: "A subcontinent of immense diversity, spirituality and colour.",
        imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
        continent: continentMap.get("Asia"),
      },
      {
        name: "Japan",
        description: "A seamless blend of ancient tradition and futuristic innovation.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
        continent: continentMap.get("Asia"),
      },
      {
        name: "China",
        description: "One of the world's oldest civilizations, home to iconic landmarks.",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
        continent: continentMap.get("Asia"),
      },
      {
        name: "France",
        description: "Land of art, cuisine, fashion and the Eiffel Tower.",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
        continent: continentMap.get("Europe"),
      },
      {
        name: "Italy",
        description: "A living museum of history, Renaissance art and world-class food.",
        imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
        continent: continentMap.get("Europe"),
      },
      {
        name: "United States",
        description: "A land of sweeping national parks, vibrant cities and iconic landmarks.",
        imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74",
        continent: continentMap.get("North America"),
      },
      {
        name: "Australia",
        description: "A continent of red deserts, coral reefs and unique wildlife.",
        imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
        continent: continentMap.get("Oceania"),
      },
    ];
    const countries = await Country.insertMany(countriesData);

    const countryMap = new Map<string, mongoose.Types.ObjectId>();
    countries.forEach((c) => countryMap.set(c.name, c._id as mongoose.Types.ObjectId));
    console.log(`   → ${countries.length} countries inserted`);

    // ── 3. Users ──────────────────────────────────────────────────────────────
    console.log("👤  Seeding Users...");
    const hashedPassword = await bcrypt.hash("Password123!", 12);
    const usersData = [
      {
        firstName: "Admin",
        lastName: "User",
        username: "admin_alex",
        email: "admin@destino.ai",
        password: hashedPassword,
        role: "admin",
        avatarUrl: "https://i.pravatar.cc/150?u=alex",
      },
      {
        firstName: "John",
        lastName: "Traveler",
        username: "john_traveler",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        avatarUrl: "https://i.pravatar.cc/150?u=john",
      },
      {
        firstName: "Sarah",
        lastName: "Explorer",
        username: "sarah_explorer",
        email: "sarah@example.com",
        password: hashedPassword,
        role: "user",
        avatarUrl: "https://i.pravatar.cc/150?u=sarah",
      },
    ];
    const users = await User.insertMany(usersData as any);
    console.log(`   → ${users.length} users inserted`);

    // ── 4. Destinations ───────────────────────────────────────────────────────
    console.log("📍  Seeding Destinations...");
    const destinationsData = [
      {
        name: "Hampi",
        description: "Ancient village in Karnataka featuring ruins of Vijayanagara Empire temples.",
        location: { city: "Hampi", country: countryMap.get("India") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1600100397608-f010e423b971"],
        bestTimeToVisit: "October to February",
        openingHours: "06:00 AM - 06:00 PM",
        ticketPrice: "$10",
        website: "https://karnatakatourism.org/hampi",
        isFeatured: true,
      },
      {
        name: "Taj Mahal",
        description: "An immense mausoleum of white marble in Agra, a UNESCO World Heritage Site.",
        location: { city: "Agra", country: countryMap.get("India") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1564507592333-c60657eea523"],
        bestTimeToVisit: "October to March",
        openingHours: "06:00 AM - 07:00 PM",
        ticketPrice: "$15",
        website: "https://tajmahal.gov.in",
        isFeatured: true,
      },
      {
        name: "Goa Beaches",
        description: "Sun-kissed coastline with vibrant nightlife and sandy shores.",
        location: { city: "Panaji", country: countryMap.get("India") },
        category: "beach" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2"],
        bestTimeToVisit: "November to February",
        openingHours: "24/7",
        ticketPrice: "Free",
        isFeatured: false,
      },
      {
        name: "Mount Fuji",
        description: "Japan's tallest peak, an active volcano with an iconic snow-capped cone.",
        location: { city: "Fujinomiya", country: countryMap.get("Japan") },
        category: "mountain" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"],
        bestTimeToVisit: "July to September",
        openingHours: "24/7",
        ticketPrice: "Free",
        isFeatured: true,
      },
      {
        name: "Kyoto Temples",
        description: "Historical center with thousands of classical Buddhist temples and Zen gardens.",
        location: { city: "Kyoto", country: countryMap.get("Japan") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1503899036084-c55cdd92da26"],
        bestTimeToVisit: "March to May, October to November",
        openingHours: "08:30 AM - 05:00 PM",
        ticketPrice: "$8",
        isFeatured: false,
      },
      {
        name: "Tokyo Tower",
        description: "Communications and observation tower in the Minato district of Tokyo.",
        location: { city: "Tokyo", country: countryMap.get("Japan") },
        category: "city" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1536098561742-ca998e48cbcc"],
        bestTimeToVisit: "All year",
        openingHours: "09:00 AM - 11:00 PM",
        ticketPrice: "$12",
        isFeatured: false,
      },
      {
        name: "Great Wall of China",
        description: "Series of fortifications built across northern borders of ancient China.",
        location: { city: "Beijing", country: countryMap.get("China") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d"],
        bestTimeToVisit: "September to November",
        openingHours: "07:30 AM - 05:30 PM",
        ticketPrice: "$10",
        isFeatured: true,
      },
      {
        name: "Pyramids of Giza",
        description: "Ancient pyramid complex on the outskirts of Cairo, one of the Seven Wonders of the Ancient World.",
        location: { city: "Giza", country: countryMap.get("Egypt") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"],
        bestTimeToVisit: "October to April",
        openingHours: "08:00 AM - 05:00 PM",
        ticketPrice: "$14",
        isFeatured: true,
      },
      {
        name: "Maasai Mara Safari",
        description: "Vast wilderness area in Kenya known for exceptional wildlife and the annual Great Migration.",
        location: { city: "Narok", country: countryMap.get("Kenya") },
        category: "wildlife" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1516426122078-c23e76319801"],
        bestTimeToVisit: "July to October",
        openingHours: "06:00 AM - 06:00 PM",
        ticketPrice: "$70",
        isFeatured: true,
      },
      {
        name: "Eiffel Tower",
        description: "Wrought-iron lattice tower on the Champ de Mars in Paris, one of the most recognisable structures in the world.",
        location: { city: "Paris", country: countryMap.get("France") },
        category: "city" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"],
        bestTimeToVisit: "June to August",
        openingHours: "09:00 AM - 12:45 AM",
        ticketPrice: "$25",
        website: "https://www.toureiffel.paris",
        isFeatured: true,
      },
      {
        name: "Colosseum",
        description: "An oval amphitheatre in the centre of Rome, the largest ancient amphitheatre ever built.",
        location: { city: "Rome", country: countryMap.get("Italy") },
        category: "historical" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1516483638261-f4dbaf036963"],
        bestTimeToVisit: "April to May, September to October",
        openingHours: "08:30 AM - 07:00 PM",
        ticketPrice: "$18",
        website: "https://parcocolosseo.it",
        isFeatured: true,
      },
      {
        name: "Grand Canyon",
        description: "A steep-sided canyon carved by the Colorado River in Arizona, one of Earth's great natural wonders.",
        location: { city: "Flagstaff", country: countryMap.get("United States") },
        category: "adventure" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1474044159687-1ee9f3a51722"],
        bestTimeToVisit: "March to May, September to November",
        openingHours: "24/7",
        ticketPrice: "$35",
        isFeatured: true,
      },
      {
        name: "Sydney Opera House",
        description: "Multi-venue performing arts centre in Sydney Harbour, a UNESCO World Heritage Site.",
        location: { city: "Sydney", country: countryMap.get("Australia") },
        category: "city" as Category,
        imageUrls: ["https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9"],
        bestTimeToVisit: "September to November, March to May",
        openingHours: "09:00 AM - 05:00 PM",
        ticketPrice: "$30",
        isFeatured: false,
      },
    ];
    const destinations = await Destination.insertMany(destinationsData);
    console.log(`   → ${destinations.length} destinations inserted`);

    // ── 5. Reviews ────────────────────────────────────────────────────────────
    console.log("⭐  Seeding Reviews...");

    const findDest = (name: string) => destinations.find((d) => d.name === name);
    const john = users[1]!;
    const sarah = users[2]!;

    const reviewsData = [
      {
        destination: findDest("Hampi")?._id,
        user: john._id,
        authorName: john.username,
        rating: 5,
        reviewText: "Incredible historical architecture and serene surroundings! Truly one of India's hidden gems.",
        sentiment: "positive",
        themes: ["architecture", "history", "culture"],
      },
      {
        destination: findDest("Hampi")?._id,
        user: sarah._id,
        authorName: sarah.username,
        rating: 4,
        reviewText: "Breathtaking sunset from Matanga Hill. A must visit in India.",
        sentiment: "positive",
        themes: ["sunset", "nature", "view"],
      },
      {
        destination: findDest("Taj Mahal")?._id,
        user: john._id,
        authorName: john.username,
        rating: 5,
        reviewText: "Even more stunning in person. The white marble at sunrise is unforgettable.",
        sentiment: "positive",
        themes: ["architecture", "romance", "history"],
      },
      {
        destination: findDest("Mount Fuji")?._id,
        user: sarah._id,
        authorName: sarah.username,
        rating: 5,
        reviewText: "Climbed overnight to watch the sunrise from the summit. A life-changing experience!",
        sentiment: "positive",
        themes: ["hiking", "nature", "adventure"],
      },
      {
        destination: findDest("Eiffel Tower")?._id,
        user: john._id,
        authorName: john.username,
        rating: 4,
        reviewText: "Iconic at night with the light show. Very crowded — book tickets in advance.",
        sentiment: "positive",
        themes: ["city", "romance", "landmark"],
      },
      {
        destination: findDest("Eiffel Tower")?._id,
        user: sarah._id,
        authorName: sarah.username,
        rating: 5,
        reviewText: "Absolutely breathtaking. Worth visiting at every time of day.",
        sentiment: "positive",
        themes: ["landmark", "architecture"],
      },
      {
        destination: findDest("Colosseum")?._id,
        user: john._id,
        authorName: john.username,
        rating: 5,
        reviewText: "Walking through ancient history. The audio guide really brings it to life.",
        sentiment: "positive",
        themes: ["history", "architecture", "culture"],
      },
      {
        destination: findDest("Maasai Mara Safari")?._id,
        user: sarah._id,
        authorName: sarah.username,
        rating: 5,
        reviewText: "Witnessed the Great Migration. Nothing can prepare you for the sheer scale of it.",
        sentiment: "positive",
        themes: ["wildlife", "nature", "adventure"],
      },
      {
        destination: findDest("Grand Canyon")?._id,
        user: john._id,
        authorName: john.username,
        rating: 5,
        reviewText: "Absolutely humbling. The scale and colours at golden hour are beyond words.",
        sentiment: "positive",
        themes: ["nature", "adventure", "hiking"],
      },
    ];

    // Only insert reviews where the destination was found
    const validReviews = reviewsData.filter((r) => r.destination);
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
