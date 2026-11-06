import type mongoose from "mongoose";

export interface ReviewSeedInput {
  destinationName: string;
  userIndex: 1 | 2; // 1: john, 2: sarah
  rating: number;
  reviewText: string;
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
}

export const rawReviewsData: ReviewSeedInput[] = [
  {
    destinationName: "Hampi",
    userIndex: 1,
    rating: 5,
    reviewText:
      "Incredible historical architecture and serene surroundings! Truly one of India's hidden gems.",
    sentiment: "positive",
    themes: ["architecture", "history", "culture"],
  },
  {
    destinationName: "Hampi",
    userIndex: 2,
    rating: 4,
    reviewText: "Breathtaking sunset from Matanga Hill. A must visit in India.",
    sentiment: "positive",
    themes: ["sunset", "nature", "view"],
  },
  {
    destinationName: "Taj Mahal",
    userIndex: 1,
    rating: 5,
    reviewText:
      "Even more stunning in person. The white marble at sunrise is unforgettable.",
    sentiment: "positive",
    themes: ["architecture", "romance", "history"],
  },
  {
    destinationName: "Mount Fuji",
    userIndex: 2,
    rating: 5,
    reviewText:
      "Climbed overnight to watch the sunrise from the summit. A life-changing experience!",
    sentiment: "positive",
    themes: ["hiking", "nature", "adventure"],
  },
  {
    destinationName: "Eiffel Tower",
    userIndex: 1,
    rating: 4,
    reviewText:
      "Iconic at night with the light show. Very crowded — book tickets in advance.",
    sentiment: "positive",
    themes: ["city", "romance", "landmark"],
  },
  {
    destinationName: "Eiffel Tower",
    userIndex: 2,
    rating: 5,
    reviewText: "Absolutely breathtaking. Worth visiting at every time of day.",
    sentiment: "positive",
    themes: ["landmark", "architecture"],
  },
  {
    destinationName: "Colosseum",
    userIndex: 1,
    rating: 5,
    reviewText:
      "Walking through ancient history. The audio guide really brings it to life.",
    sentiment: "positive",
    themes: ["history", "architecture", "culture"],
  },
  {
    destinationName: "Maasai Mara Safari",
    userIndex: 2,
    rating: 5,
    reviewText:
      "Witnessed the Great Migration. Nothing can prepare you for the sheer scale of it.",
    sentiment: "positive",
    themes: ["wildlife", "nature", "adventure"],
  },
  {
    destinationName: "Grand Canyon",
    userIndex: 1,
    rating: 5,
    reviewText:
      "Absolutely humbling. The scale and colours at golden hour are beyond words.",
    sentiment: "positive",
    themes: ["nature", "adventure", "hiking"],
  },
];

export const getReviewsSeedData = (
  destinations: Array<{ name: string; _id: mongoose.Types.ObjectId }>,
  users: Array<{ username: string; _id: mongoose.Types.ObjectId }>,
) => {
  const destMap = new Map<string, mongoose.Types.ObjectId>(
    destinations.map((d) => [d.name, d._id]),
  );
  const john = users[1];
  const sarah = users[2];

  if (!john || !sarah) {
    throw new Error("Seed users are missing; cannot create sample reviews.");
  }

  const userMap = {
    1: john,
    2: sarah,
  };

  const results: Array<{
    destination: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    authorName: string;
    rating: number;
    reviewText: string;
    sentiment: "positive" | "neutral" | "negative";
    themes: string[];
  }> = [];

  for (const r of rawReviewsData) {
    const user = userMap[r.userIndex];
    const destinationId = destMap.get(r.destinationName);
    if (!destinationId) continue;

    results.push({
      destination: destinationId,
      user: user._id,
      authorName: user.username,
      rating: r.rating,
      reviewText: r.reviewText,
      sentiment: r.sentiment,
      themes: r.themes,
    });
  }

  return results;
};
