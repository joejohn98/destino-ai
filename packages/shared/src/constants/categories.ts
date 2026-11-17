export const CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "historical",
  "adventure",
  "wildlife",
] as const;

export const DESTINATION_CATEGORIES = CATEGORIES;
export type Category = (typeof CATEGORIES)[number];
export type DestinationCategory = Category;

export const ATTRACTION_CATEGORIES = [
  "monument",
  "museum",
  "market",
  "nature",
  "wildlife",
  "viewpoint",
  "day-trip",
  "activity",
  "religious",
  "entertainment",
] as const;

export type AttractionCategory = (typeof ATTRACTION_CATEGORIES)[number];

export const SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];
