import type mongoose from "mongoose";
import type { Category } from "../../models/Destination.model";

export const getDestinationsSeedData = (
  countryMap: Map<string, mongoose.Types.ObjectId>,
) => [
  {
    name: "Hampi",
    description:
      "Ancient village in Karnataka featuring ruins of Vijayanagara Empire temples.",
    location: {
      city: "Hampi",
      state: "Karnataka",
      country: countryMap.get("India"),
    },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1600100397608-f010e423b971"],
    bestTimeToVisit: "October to February",
    openingHours: "06:00 AM - 06:00 PM",
    ticketPrice: "₹40",
    website: "https://karnatakatourism.org/hampi",
    isFeatured: true,
    attractions: [
      {
        name: "Virupaksha Temple",
        description:
          "The most sacred and active temple in Hampi, dedicated to Lord Shiva.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "06:00 AM - 01:00 PM, 05:00 PM - 08:30 PM",
        category: "religious",
      },
      {
        name: "Vittala Temple Complex & Stone Chariot",
        description:
          "Famous for its iconic stone chariot and extraordinary musical pillars carved in the 15th century.",
        ticketPrice: "₹40",
        suggestedDuration: "2–3 hours",
        openingHours: "08:30 AM - 05:30 PM",
        category: "monument",
      },
      {
        name: "Matanga Hill",
        description:
          "The highest hill in Hampi offering panoramic sunrise and sunset views over the ruined city.",
        ticketPrice: "Free",
        suggestedDuration: "2 hours (incl. climb)",
        openingHours: "Open 24/7 (sunrise recommended)",
        category: "viewpoint",
      },
      {
        name: "Lotus Mahal & Royal Enclosure",
        description:
          "A delicately designed Indo-Islamic pleasure pavilion inside the royal zenana enclosure.",
        ticketPrice: "₹40",
        suggestedDuration: "1–2 hours",
        openingHours: "08:30 AM - 05:30 PM",
        category: "monument",
      },
      {
        name: "Elephant Stables",
        description:
          "Magnificent row of 11 chambers once housing the royal war elephants of the Vijayanagara kings.",
        ticketPrice: "₹40",
        suggestedDuration: "1 hour",
        openingHours: "08:30 AM - 05:30 PM",
        category: "monument",
      },
      {
        name: "Hampi Bazaar & Hemakuta Hill Temples",
        description:
          "Ancient marketplace lined with stone stalls leading to Hemakuta Hill's cluster of early Jain and Shaiva temples.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "All day",
        category: "market",
      },
      {
        name: "Tungabhadra River Coracle Ride",
        description:
          "Traditional circular bamboo basket boat ride across the Tungabhadra river to reach the northern ruins.",
        ticketPrice: "₹30",
        suggestedDuration: "30 minutes",
        openingHours: "07:00 AM - 06:00 PM",
        category: "activity",
      },
    ],
  },
  {
    name: "Taj Mahal",
    description:
      "An immense mausoleum of white marble in Agra, a UNESCO World Heritage Site and one of the Seven Wonders of the World.",
    location: {
      city: "Agra",
      state: "Uttar Pradesh",
      country: countryMap.get("India"),
    },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1564507592333-c60657eea523"],
    bestTimeToVisit: "October to March",
    openingHours: "06:00 AM - 07:00 PM (Closed on Fridays)",
    ticketPrice: "₹50 (Indians), ₹1,300 (Foreigners)",
    website: "https://tajmahal.gov.in",
    isFeatured: true,
    attractions: [
      {
        name: "Taj Mahal Sunrise Viewing",
        description:
          "Witness the white marble mausoleum bathed in golden light at sunrise — the most iconic experience in Agra.",
        ticketPrice: "₹50",
        suggestedDuration: "2–3 hours",
        openingHours: "06:00 AM - 07:00 PM (Closed Fridays)",
        category: "monument",
      },
      {
        name: "Agra Fort",
        description:
          "A massive 16th-century Mughal fort and UNESCO World Heritage Site with palaces, mosques, and panoramic Taj Mahal views.",
        ticketPrice: "₹40",
        suggestedDuration: "2–3 hours",
        openingHours: "06:00 AM - 06:00 PM",
        category: "monument",
      },
      {
        name: "Mehtab Bagh",
        description:
          "Charbagh complex across the Yamuna river offering the best sunset views of the Taj Mahal silhouetted against the sky.",
        ticketPrice: "₹25",
        suggestedDuration: "1–2 hours",
        openingHours: "06:00 AM - 07:00 PM",
        category: "viewpoint",
      },
      {
        name: "Fatehpur Sikri Day Excursion",
        description:
          "UNESCO World Heritage abandoned Mughal capital 40 km from Agra, featuring the grand Buland Darwaza gateway and Salim Chishti's Tomb.",
        ticketPrice: "₹40",
        suggestedDuration: "Half day",
        openingHours: "08:00 AM - 06:00 PM",
        category: "day-trip",
      },
      {
        name: "Tomb of Itimad-ud-Daulah (Baby Taj)",
        description:
          "The first Mughal structure built entirely from marble, known as the 'Baby Taj' for its intricate pietra dura inlay work.",
        ticketPrice: "₹30",
        suggestedDuration: "1–2 hours",
        openingHours: "06:00 AM - 06:00 PM",
        category: "monument",
      },
      {
        name: "Akbar's Tomb, Sikandra",
        description:
          "The grand mausoleum of Mughal Emperor Akbar, set within a deer-inhabited garden complex 8 km from Agra.",
        ticketPrice: "₹25",
        suggestedDuration: "1–2 hours",
        openingHours: "06:00 AM - 06:00 PM",
        category: "monument",
      },
      {
        name: "Sadar Bazaar & Marble Handicrafts",
        description:
          "Agra's main market for marble inlay souvenirs, leather goods, and the famous Agra Petha sweets.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "10:00 AM - 08:00 PM",
        category: "market",
      },
    ],
  },
  {
    name: "Goa Beaches",
    description:
      "Sun-kissed coastline with vibrant nightlife, Portuguese heritage, and sandy shores.",
    location: {
      city: "Panaji",
      state: "Goa",
      country: countryMap.get("India"),
    },
    category: "beach" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2"],
    bestTimeToVisit: "November to February",
    openingHours: "24/7",
    ticketPrice: "Free",
    isFeatured: false,
    attractions: [
      {
        name: "Calangute & Baga Beach",
        description:
          "Goa's most popular beaches — Calangute for long stretches of sand and Baga for water sports, shacks, and vibrant nightlife.",
        ticketPrice: "Free",
        suggestedDuration: "Half to full day",
        openingHours: "24/7",
        category: "nature",
      },
      {
        name: "Anjuna Flea Market",
        description:
          "Iconic Wednesday flea market selling handicrafts, spices, clothing, and antiques — a Goa institution since the 1970s.",
        ticketPrice: "Free",
        suggestedDuration: "2–3 hours",
        openingHours: "Wednesdays 08:00 AM - 06:00 PM",
        category: "market",
      },
      {
        name: "Basilica of Bom Jesus, Old Goa",
        description:
          "UNESCO World Heritage baroque church housing the mortal remains of St Francis Xavier, a masterpiece of Portuguese colonial architecture.",
        ticketPrice: "Free",
        suggestedDuration: "1 hour",
        openingHours: "09:00 AM - 06:30 PM",
        category: "religious",
      },
      {
        name: "Dudhsagar Waterfalls",
        description:
          "Four-tiered waterfall on the Mandovi river, one of India's tallest, accessible by jeep safari through the Bhagwan Mahavir Wildlife Sanctuary.",
        ticketPrice: "₹400 (jeep safari)",
        suggestedDuration: "Full day excursion",
        openingHours: "08:00 AM - 05:00 PM (seasonal)",
        category: "day-trip",
      },
      {
        name: "Chapora Fort",
        description:
          "15th-century Portuguese fort offering dramatic cliffside views over the Arabian Sea and surrounding green coastline.",
        ticketPrice: "Free",
        suggestedDuration: "1 hour",
        openingHours: "09:30 AM - 05:30 PM",
        category: "monument",
      },
      {
        name: "Panjim Heritage Quarter & Fontainhas",
        description:
          "Goa's charming Latin Quarter with colourful Portuguese colonial houses, art galleries, and the Chapel of St Sebastian.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "All day",
        category: "entertainment",
      },
      {
        name: "Palolem Beach",
        description:
          "Crescent-shaped beach in South Goa offering calmer waters, silent disco nights, and a relaxed hippie atmosphere.",
        ticketPrice: "Free",
        suggestedDuration: "Half to full day",
        openingHours: "24/7",
        category: "nature",
      },
    ],
  },
  {
    name: "Mount Fuji",
    description:
      "Japan's tallest peak, an active stratovolcano with an iconic snow-capped cone and a UNESCO World Heritage Site.",
    location: { city: "Fujinomiya", country: countryMap.get("Japan") },
    category: "mountain" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"],
    bestTimeToVisit: "July to September",
    openingHours: "Climbing season: July–September",
    ticketPrice: "¥2,000 (conservation fee)",
    isFeatured: true,
    attractions: [
      {
        name: "Mt Fuji Summit Climb (Yoshida Trail)",
        description:
          "The iconic overnight hike from 5th Station to the 3,776 m summit to watch the sacred sunrise (Goraiko) from the crater rim.",
        ticketPrice: "¥2,000",
        suggestedDuration: "10–14 hours round trip",
        openingHours: "July–September (24/7 during climbing season)",
        category: "activity",
      },
      {
        name: "Chureito Pagoda & Arakurayama Sengen Park",
        description:
          "Iconic five-storey pagoda framing a perfect view of Mount Fuji — the most photographed scene in Japan.",
        ticketPrice: "Free",
        suggestedDuration: "2 hours (incl. 398 steps)",
        openingHours: "24/7",
        category: "viewpoint",
      },
      {
        name: "Fuji Five Lakes (Kawaguchiko)",
        description:
          "Scenic lakeside town offering the finest reflection views of Fuji across Lake Kawaguchi, boat rides, and ropeway ascents.",
        ticketPrice: "¥900 (ropeway)",
        suggestedDuration: "Half to full day",
        openingHours: "All day",
        category: "nature",
      },
      {
        name: "Fujisan World Heritage Centre",
        description:
          "Museum exploring the geological, spiritual, and cultural significance of Mt Fuji with an immersive inverted Fuji installation.",
        ticketPrice: "¥300",
        suggestedDuration: "1–2 hours",
        openingHours: "09:00 AM - 05:00 PM",
        category: "museum",
      },
      {
        name: "Oshino Hakkai Springs",
        description:
          "Eight crystal-clear natural spring pools fed by Mt Fuji's snowmelt, set in a traditional thatched-roof village.",
        ticketPrice: "¥500",
        suggestedDuration: "1 hour",
        openingHours: "09:00 AM - 05:00 PM",
        category: "nature",
      },
    ],
  },
  {
    name: "Kyoto Temples",
    description:
      "Historical center of Japan with thousands of classical Buddhist temples, imperial palaces, and Zen gardens.",
    location: { city: "Kyoto", country: countryMap.get("Japan") },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1503899036084-c55cdd92da26"],
    bestTimeToVisit: "March to May, October to November",
    openingHours: "Varies by site",
    ticketPrice: "¥500–¥1,000 per temple",
    isFeatured: false,
    attractions: [
      {
        name: "Fushimi Inari Taisha",
        description:
          "Shinto shrine famous for its thousands of vermillion torii gates winding up the wooded Mount Inari.",
        ticketPrice: "Free",
        suggestedDuration: "2–4 hours",
        openingHours: "24/7",
        category: "religious",
      },
      {
        name: "Arashiyama Bamboo Grove",
        description:
          "Enchanting walk through towering bamboo stalks on the western outskirts of Kyoto, near the Tenryuji Temple garden.",
        ticketPrice: "Free (¥500 for Tenryuji garden)",
        suggestedDuration: "1–2 hours",
        openingHours: "24/7",
        category: "nature",
      },
      {
        name: "Kinkakuji (Golden Pavilion)",
        description:
          "Zen Buddhist temple whose top two floors are completely covered in gold leaf, reflected in the surrounding Mirror Pond.",
        ticketPrice: "¥500",
        suggestedDuration: "1 hour",
        openingHours: "09:00 AM - 05:00 PM",
        category: "religious",
      },
      {
        name: "Gion District & Hanamikoji Street",
        description:
          "Kyoto's famous geisha district with preserved machiya townhouses, tea houses, and the chance to spot a maiko at dusk.",
        ticketPrice: "Free",
        suggestedDuration: "2 hours (evening recommended)",
        openingHours: "All day",
        category: "entertainment",
      },
      {
        name: "Nishiki Market",
        description:
          "Kyoto's narrow covered market street known as 'Nishiki's Kitchen' selling pickles, tofu, fresh fish, and street food.",
        ticketPrice: "Free",
        suggestedDuration: "1 hour",
        openingHours: "09:00 AM - 06:00 PM",
        category: "market",
      },
      {
        name: "Philosopher's Path",
        description:
          "Scenic stone path along a canal lined with hundreds of cherry trees, connecting Ginkakuji to Nanzenji temple.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "24/7",
        category: "nature",
      },
    ],
  },
  {
    name: "Tokyo Tower",
    description:
      "Iconic communications and observation tower in central Tokyo with panoramic city views.",
    location: { city: "Tokyo", country: countryMap.get("Japan") },
    category: "city" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1536098561742-ca998e48cbcc"],
    bestTimeToVisit:
      "All year (cherry blossom in March–April, autumn leaves in November)",
    openingHours: "09:00 AM - 11:00 PM",
    ticketPrice: "¥1,200",
    isFeatured: false,
    attractions: [
      {
        name: "Tokyo Tower Observatory",
        description:
          "Eiffel-inspired orange-and-white lattice tower offering 150 m and 250 m observation decks over the Tokyo skyline.",
        ticketPrice: "¥1,200",
        suggestedDuration: "1–2 hours",
        openingHours: "09:00 AM - 11:00 PM",
        category: "viewpoint",
      },
      {
        name: "Shibuya Crossing & Scramble Square",
        description:
          "The world's busiest pedestrian crossing, best viewed from the Starbucks or Scramble Square rooftop observation deck.",
        ticketPrice: "Free (¥2,000 for Scramble Square deck)",
        suggestedDuration: "1–2 hours",
        openingHours: "24/7",
        category: "entertainment",
      },
      {
        name: "Senso-ji Temple, Asakusa",
        description:
          "Tokyo's oldest and most visited Buddhist temple with the iconic Kaminarimon (Thunder Gate) and Nakamise shopping street.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "06:00 AM - 05:00 PM (main hall)",
        category: "religious",
      },
      {
        name: "Shinjuku Golden Gai & Kabukicho",
        description:
          "Atmospheric labyrinth of over 200 tiny bars in a narrow alley network, adjacent to Tokyo's famous entertainment district.",
        ticketPrice: "Free",
        suggestedDuration: "Evening (2–3 hours)",
        openingHours: "From 6:00 PM",
        category: "entertainment",
      },
      {
        name: "Tsukiji Outer Market",
        description:
          "The world-famous tuna auction market's outer section selling the freshest sushi, sashimi, and street food for breakfast.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "05:00 AM - 02:00 PM (busiest before 10 AM)",
        category: "market",
      },
      {
        name: "Harajuku Takeshita Street",
        description:
          "Colorful pedestrian lane famous for teen street fashion, crepes, and quirky pop-culture shops.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "11:00 AM - 08:00 PM",
        category: "market",
      },
    ],
  },
  {
    name: "Great Wall of China",
    description:
      "Series of fortifications built across the northern borders of China stretching thousands of kilometres.",
    location: { city: "Beijing", country: countryMap.get("China") },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1508804185872-d7badad00f7d"],
    bestTimeToVisit: "September to November",
    openingHours: "07:30 AM - 05:30 PM",
    ticketPrice: "¥40–¥65",
    isFeatured: true,
    attractions: [
      {
        name: "Mutianyu Great Wall Section",
        description:
          "The most scenic and best-restored section of the Wall, with toboggan rides down and fewer crowds than Badaling.",
        ticketPrice: "¥65",
        suggestedDuration: "3–4 hours",
        openingHours: "07:30 AM - 06:00 PM",
        category: "monument",
      },
      {
        name: "Forbidden City (Palace Museum)",
        description:
          "Vast imperial palace complex in central Beijing that was home to 24 emperors over 500 years of Ming and Qing dynasties.",
        ticketPrice: "¥60",
        suggestedDuration: "3–4 hours",
        openingHours: "08:30 AM - 05:00 PM (closed Mondays)",
        category: "monument",
      },
      {
        name: "Tiananmen Square",
        description:
          "One of the world's largest public squares flanked by the Gate of Heavenly Peace, Mao's Mausoleum, and National Museum.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "05:00 AM - 10:30 PM",
        category: "monument",
      },
      {
        name: "Summer Palace (Yiheyuan)",
        description:
          "Stunning imperial garden complex with Kunming Lake, the Long Corridor, and the Marble Boat, a masterpiece of Chinese landscape gardening.",
        ticketPrice: "¥30",
        suggestedDuration: "3–4 hours",
        openingHours: "06:30 AM - 06:00 PM",
        category: "nature",
      },
      {
        name: "Temple of Heaven (Tiantan)",
        description:
          "Imperial sacrificial altar complex where emperors prayed for good harvests — a supreme example of Ming dynasty architecture.",
        ticketPrice: "¥35",
        suggestedDuration: "2–3 hours",
        openingHours: "08:00 AM - 05:30 PM",
        category: "religious",
      },
      {
        name: "Wangfujing Street Night Market",
        description:
          "Beijing's most famous shopping and food street with exotic street snacks including scorpions, silk shops, and department stores.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours (evening)",
        openingHours: "09:00 AM - 10:00 PM",
        category: "market",
      },
    ],
  },
  {
    name: "Pyramids of Giza",
    description:
      "Ancient pyramid complex on the Giza Plateau, one of the Seven Wonders of the Ancient World and a UNESCO World Heritage Site.",
    location: { city: "Giza", country: countryMap.get("Egypt") },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368"],
    bestTimeToVisit: "October to April",
    openingHours: "08:00 AM - 05:00 PM",
    ticketPrice: "EGP 360",
    isFeatured: true,
    attractions: [
      {
        name: "Pyramid of Khufu (Great Pyramid)",
        description:
          "The oldest and largest of the three Giza pyramids, and the only surviving Wonder of the Ancient World. Enter the king's chamber for an unforgettable experience.",
        ticketPrice: "EGP 360 (exterior), EGP 600 (interior)",
        suggestedDuration: "2–3 hours",
        openingHours: "08:00 AM - 05:00 PM",
        category: "monument",
      },
      {
        name: "Great Sphinx",
        description:
          "Iconic limestone statue with a lion's body and human head, guarding the Giza plateau for over 4,500 years.",
        ticketPrice: "Included in Giza complex ticket",
        suggestedDuration: "30 minutes",
        openingHours: "08:00 AM - 05:00 PM",
        category: "monument",
      },
      {
        name: "Step Pyramid of Saqqara Day Trip",
        description:
          "Egypt's oldest pyramid — the 4,700-year-old Step Pyramid of Djoser, with far fewer tourists than Giza.",
        ticketPrice: "EGP 150",
        suggestedDuration: "Half day excursion",
        openingHours: "08:00 AM - 04:00 PM",
        category: "day-trip",
      },
      {
        name: "Egyptian Museum, Cairo",
        description:
          "Home to the world's most extensive collection of Pharaonic antiquities including Tutankhamun's gold death mask and mummy galleries.",
        ticketPrice: "EGP 200",
        suggestedDuration: "3–4 hours",
        openingHours: "09:00 AM - 05:00 PM",
        category: "museum",
      },
      {
        name: "Khan el-Khalili Bazaar",
        description:
          "Cairo's famous medieval bazaar selling spices, gold, silver, perfume, and souvenirs in a labyrinth of narrow medieval alleys.",
        ticketPrice: "Free",
        suggestedDuration: "1–3 hours",
        openingHours: "09:00 AM - 11:00 PM",
        category: "market",
      },
      {
        name: "Camel Ride & Desert Sunset Viewpoint",
        description:
          "Camel ride around the Giza plateau with a panoramic sunset view of all three pyramids from the desert viewpoint.",
        ticketPrice: "EGP 150–300",
        suggestedDuration: "1–2 hours (evening)",
        openingHours: "Sunset daily",
        category: "activity",
      },
    ],
  },
  {
    name: "Maasai Mara Safari",
    description:
      "Vast wilderness area in Kenya's Rift Valley known for exceptional Big Five wildlife and the Great Wildebeest Migration.",
    location: { city: "Narok", country: countryMap.get("Kenya") },
    category: "wildlife" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1516426122078-c23e76319801"],
    bestTimeToVisit: "July to October",
    openingHours: "06:00 AM - 06:00 PM",
    ticketPrice: "$80",
    isFeatured: true,
    attractions: [
      {
        name: "Big Five Morning Game Drive",
        description:
          "Dawn game drive in open 4x4 safari vehicles to spot lions, leopards, elephants, buffalo, and rhinos in their natural habitat.",
        ticketPrice: "Included in park fees + guide fees",
        suggestedDuration: "4–5 hours",
        openingHours: "06:00 AM - 11:00 AM",
        category: "activity",
      },
      {
        name: "Great Migration River Crossing (Mara River)",
        description:
          "Witness hundreds of thousands of wildebeest and zebras risk crocodile-filled waters at the Mara River — the world's greatest wildlife spectacle.",
        ticketPrice: "Included in park fees",
        suggestedDuration: "4–6 hours (wait at crossing point)",
        openingHours: "July–October only",
        category: "activity",
      },
      {
        name: "Maasai Village Cultural Visit",
        description:
          "Authentic visit to a traditional Maasai village to experience warrior dances, beadwork craft, and learn about nomadic pastoral culture.",
        ticketPrice: "$20–30 per person",
        suggestedDuration: "1–2 hours",
        openingHours: "By arrangement",
        category: "entertainment",
      },
      {
        name: "Hot Air Balloon Safari at Sunrise",
        description:
          "Drift silently over the savannah at dawn, spotting wildlife from the air, followed by a champagne bush breakfast.",
        ticketPrice: "$450–550 per person",
        suggestedDuration: "4 hours (1 hour flight)",
        openingHours: "06:00 AM (pre-booked only)",
        category: "activity",
      },
      {
        name: "Evening Sundowner Drive",
        description:
          "Late afternoon game drive pausing at a scenic viewpoint for drinks as the sun sets over the golden Mara grasslands.",
        ticketPrice: "Included in lodge packages",
        suggestedDuration: "3–4 hours",
        openingHours: "04:00 PM - 07:30 PM",
        category: "activity",
      },
    ],
  },
  {
    name: "Eiffel Tower",
    description:
      "Wrought-iron lattice tower on the Champ de Mars in Paris, one of the most recognisable structures in the world.",
    location: { city: "Paris", country: countryMap.get("France") },
    category: "city" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34"],
    bestTimeToVisit: "April to June, September to October",
    openingHours: "09:00 AM - 12:45 AM",
    ticketPrice: "€29.40",
    website: "https://www.toureiffel.paris",
    isFeatured: true,
    attractions: [
      {
        name: "Eiffel Tower Summit Visit",
        description:
          "Take the lift to the 276 m summit for 360-degree views over Paris, with views extending up to 70 km on a clear day.",
        ticketPrice: "€29.40",
        suggestedDuration: "2–3 hours",
        openingHours: "09:00 AM - 12:45 AM (last lift 11 PM)",
        category: "viewpoint",
      },
      {
        name: "Louvre Museum",
        description:
          "World's largest and most visited art museum, home to da Vinci's Mona Lisa, Venus de Milo, and 380,000 works of art.",
        ticketPrice: "€22",
        suggestedDuration: "3–4 hours (minimum)",
        openingHours:
          "09:00 AM - 06:00 PM (Wed & Fri until 9:45 PM, closed Tuesdays)",
        category: "museum",
      },
      {
        name: "Musée d'Orsay",
        description:
          "Housed in a converted Beaux-Arts railway station, containing the world's finest collection of Impressionist art including Monet and Renoir.",
        ticketPrice: "€16",
        suggestedDuration: "2–3 hours",
        openingHours: "09:30 AM - 06:00 PM (Thursday until 9:45 PM)",
        category: "museum",
      },
      {
        name: "Seine River Cruise (Bateaux Mouches)",
        description:
          "Iconic boat cruise along the Seine passing Notre-Dame, the Louvre, and the Eiffel Tower — stunning by day or at night.",
        ticketPrice: "€15",
        suggestedDuration: "1 hour",
        openingHours: "10:00 AM - 10:30 PM (hourly)",
        category: "activity",
      },
      {
        name: "Palace of Versailles Day Trip",
        description:
          "Louis XIV's extravagant royal palace 30 km from Paris, with the Hall of Mirrors, royal apartments, and vast French formal gardens.",
        ticketPrice: "€20",
        suggestedDuration: "Full day excursion",
        openingHours: "09:00 AM - 05:30 PM (closed Mondays)",
        category: "day-trip",
      },
      {
        name: "Montmartre & Sacré-Cœur",
        description:
          "Bohemian hilltop neighbourhood with artists' studios, the white-domed Sacré-Cœur basilica, and sweeping views over Paris.",
        ticketPrice: "Free",
        suggestedDuration: "2–3 hours",
        openingHours: "06:00 AM - 10:30 PM",
        category: "viewpoint",
      },
    ],
  },
  {
    name: "Colosseum",
    description:
      "An oval amphitheatre in the centre of Rome, the largest ancient amphitheatre ever built, seating up to 80,000 spectators.",
    location: { city: "Rome", country: countryMap.get("Italy") },
    category: "historical" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1516483638261-f4dbaf036963"],
    bestTimeToVisit: "April to May, September to October",
    openingHours: "09:00 AM - 07:00 PM",
    ticketPrice: "€18",
    website: "https://parcocolosseo.it",
    isFeatured: true,
    attractions: [
      {
        name: "Colosseum Arena Floor & Underground",
        description:
          "Explore the iconic amphitheatre's arena floor where gladiators fought, plus the hypogeum underground tunnels used by combatants and animals.",
        ticketPrice: "€18 (€26 with underground access)",
        suggestedDuration: "2–3 hours",
        openingHours: "09:00 AM - 07:00 PM",
        category: "monument",
      },
      {
        name: "Roman Forum & Palatine Hill",
        description:
          "The civic heart of ancient Rome — the Forum's temples and arches combined with Palatine Hill's imperial palace ruins are included with the Colosseum ticket.",
        ticketPrice: "Included with Colosseum ticket",
        suggestedDuration: "2–3 hours",
        openingHours: "09:00 AM - 07:00 PM",
        category: "monument",
      },
      {
        name: "Vatican Museums & Sistine Chapel",
        description:
          "One of the world's greatest museum complexes culminating in Michelangelo's breathtaking painted ceiling of the Sistine Chapel.",
        ticketPrice: "€20",
        suggestedDuration: "3–5 hours",
        openingHours:
          "09:00 AM - 06:00 PM (closed Sundays except last Sunday of month)",
        category: "museum",
      },
      {
        name: "Trevi Fountain",
        description:
          "The world's most famous baroque fountain where travellers toss a coin to ensure their return to Rome — best visited at dawn.",
        ticketPrice: "Free",
        suggestedDuration: "30 minutes",
        openingHours: "24/7",
        category: "monument",
      },
      {
        name: "Borghese Gallery",
        description:
          "Intimate villa museum housing Bernini's spectacular marble sculptures and Caravaggio paintings in intimate, ornate rooms.",
        ticketPrice: "€15",
        suggestedDuration: "2 hours (timed entry, booking required)",
        openingHours: "09:00 AM - 05:00 PM (closed Mondays)",
        category: "museum",
      },
      {
        name: "Trastevere Evening Walk & Local Dining",
        description:
          "Rome's most charming medieval neighbourhood with cobblestone alleys, ivy-clad restaurants, and the beautiful Santa Maria in Trastevere church.",
        ticketPrice: "Free",
        suggestedDuration: "2–3 hours (evening)",
        openingHours: "All day",
        category: "entertainment",
      },
    ],
  },
  {
    name: "Grand Canyon",
    description:
      "A steep-sided canyon carved by the Colorado River over millions of years in Arizona, one of Earth's greatest natural wonders.",
    location: {
      city: "Flagstaff",
      country: countryMap.get("United States"),
    },
    category: "adventure" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1474044159687-1ee9f3a51722"],
    bestTimeToVisit: "March to May, September to November",
    openingHours: "24/7 (park open year-round)",
    ticketPrice: "$35 per vehicle",
    isFeatured: true,
    attractions: [
      {
        name: "South Rim Viewpoints (Mather & Yavapai)",
        description:
          "The most accessible and spectacular viewpoints over the 1.6 km deep canyon — Mather Point at sunrise is unmissable.",
        ticketPrice: "Included in park fee",
        suggestedDuration: "2–3 hours",
        openingHours: "24/7 (park open year-round)",
        category: "viewpoint",
      },
      {
        name: "Bright Angel Trail Hike",
        description:
          "The canyon's most iconic trail descending 2,400 m to the Colorado River — hike to Indian Garden (8 km round trip) for a rewarding canyon floor view.",
        ticketPrice: "Included in park fee",
        suggestedDuration: "4–8 hours (depending on depth)",
        openingHours: "24/7",
        category: "activity",
      },
      {
        name: "Grand Canyon Helicopter Tour",
        description:
          "Breathtaking aerial tour descending 1,200 m below the rim to the canyon floor, flying along the Colorado River gorge.",
        ticketPrice: "$300–400",
        suggestedDuration: "3–4 hours (incl. transfer)",
        openingHours: "08:00 AM - 05:00 PM",
        category: "activity",
      },
      {
        name: "Colorado River Rafting Day Trip",
        description:
          "White-water rafting through the canyon's Class V rapids on the Colorado River — among the most thrilling river experiences in the world.",
        ticketPrice: "$250–350",
        suggestedDuration: "Full day",
        openingHours: "By arrangement (May–September)",
        category: "activity",
      },
      {
        name: "Havasu Falls (Havasupai Tribe Lands)",
        description:
          "Extraordinary turquoise waterfall accessible by a 16 km desert hike into Havasupai Tribal lands — a bucket-list experience requiring advance reservation.",
        ticketPrice: "$200 (permit + camping)",
        suggestedDuration: "2–3 days (overnight)",
        openingHours: "By advance permit only",
        category: "day-trip",
      },
      {
        name: "Desert View Watchtower",
        description:
          "70-year-old stone observation tower at the East Rim offering panoramic views of the canyon, the Painted Desert, and the San Francisco Peaks.",
        ticketPrice: "Included in park fee",
        suggestedDuration: "1 hour",
        openingHours: "08:00 AM - 08:00 PM (seasonal)",
        category: "viewpoint",
      },
    ],
  },
  {
    name: "Sydney Opera House",
    description:
      "Multi-venue performing arts centre in Sydney Harbour, one of the 20th century's greatest architectural works and a UNESCO World Heritage Site.",
    location: { city: "Sydney", country: countryMap.get("Australia") },
    category: "city" as Category,
    imageUrls: ["https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9"],
    bestTimeToVisit: "September to November, March to May",
    openingHours: "09:00 AM - 05:00 PM",
    ticketPrice: "$44 (guided tour)",
    isFeatured: false,
    attractions: [
      {
        name: "Sydney Opera House Guided Tour",
        description:
          "Behind-the-scenes tour of the iconic sail-shaped building exploring the Concert Hall, Drama Theatre, and dramatic harbourside interiors.",
        ticketPrice: "$44",
        suggestedDuration: "1 hour",
        openingHours: "09:00 AM - 05:00 PM",
        category: "entertainment",
      },
      {
        name: "Harbour Bridge Climb (BridgeClimb)",
        description:
          "Thrilling guided climb to the 134 m summit of the Sydney Harbour Bridge for a 360-degree panorama of the city, harbour, and Blue Mountains.",
        ticketPrice: "$168–$408 (varies by time)",
        suggestedDuration: "3.5 hours",
        openingHours: "07:00 AM - 07:00 PM (bookings required)",
        category: "activity",
      },
      {
        name: "Bondi to Coogee Coastal Walk",
        description:
          "Sydney's most iconic coastal walk (6 km) linking Bondi Beach to Coogee through a series of headlands, sea baths, and ocean pools.",
        ticketPrice: "Free",
        suggestedDuration: "2–3 hours",
        openingHours: "24/7",
        category: "nature",
      },
      {
        name: "Taronga Zoo Ferry & Skyway",
        description:
          "Ferry across the harbour to Taronga Zoo — home to koalas, kangaroos, Tasmanian devils, and giraffes with harbour views.",
        ticketPrice: "$47 + ferry",
        suggestedDuration: "Half day",
        openingHours: "09:30 AM - 05:00 PM",
        category: "activity",
      },
      {
        name: "Royal Botanic Garden",
        description:
          "Sydney's free outdoor garden along Farm Cove with themed gardens, flying fox colony, and the finest Harbour Bridge and Opera House views.",
        ticketPrice: "Free",
        suggestedDuration: "1–2 hours",
        openingHours: "07:00 AM - 8:00 PM (seasonal)",
        category: "nature",
      },
      {
        name: "Manly Beach & Ferry Day Trip",
        description:
          "30-minute Manly Ferry from Circular Quay — one of the world's great ferry rides — to the relaxed Northern Beaches surf town of Manly.",
        ticketPrice: "$9 (ferry)",
        suggestedDuration: "Half day",
        openingHours: "All day",
        category: "day-trip",
      },
    ],
  },
];
