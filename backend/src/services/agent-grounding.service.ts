import mongoose from "mongoose";
import type { ComparisonOutput } from "../agents/comparison.agent";
import type { ItineraryOutput } from "../agents/planner.agent";
import { Destination } from "../models/Destination.model";
import { Review } from "../models/Review.model";

/**
 * Validates and enforces destination attractions and review grounding on generated itineraries.
 * 1. Checks that all activities exist in the verified attractions list for that destination.
 * 2. If no attractions exist, sets activities to [].
 * 3. If neither travel tips nor reviews exist, clears tips.
 */
export const enforceAttractionGrounding = async (
  output: ItineraryOutput,
): Promise<ItineraryOutput> => {
  if (output.status !== "success" || !output.days || output.days.length === 0) {
    return output;
  }

  const destinationIds = [
    ...new Set(
      output.days
        .map((d) => d.destinationId)
        .filter(
          (id): id is string => Boolean(id) && mongoose.isValidObjectId(id),
        ),
    ),
  ];

  if (destinationIds.length === 0) {
    return output;
  }

  const destinations = await Destination.find({
    _id: { $in: destinationIds },
  })
    .select("_id name attractions travelTips")
    .lean();

  const destinationMap = new Map(
    destinations.map((dest) => [String(dest._id), dest]),
  );

  const reviewCounts = await Review.aggregate([
    {
      $match: {
        destination: {
          $in: destinationIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    { $group: { _id: "$destination", count: { $sum: 1 } } },
  ]);

  const reviewCountMap = new Map(
    reviewCounts.map((rc) => [String(rc._id), rc.count]),
  );

  const warnings = new Set(output.warnings ?? []);

  for (const day of output.days) {
    const dest = destinationMap.get(day.destinationId);
    if (!dest) continue;

    const verifiedAttractions = (dest.attractions ?? []).map((a) =>
      a.name.toLowerCase().trim(),
    );

    if (verifiedAttractions.length === 0) {
      day.activities = [];
      warnings.add(`No verified attractions are available for ${dest.name}.`);
    } else if (day.activities && day.activities.length > 0) {
      day.activities = day.activities.filter((act) => {
        const actLower = act.toLowerCase().trim();
        return verifiedAttractions.some(
          (attrName) =>
            actLower.includes(attrName) || attrName.includes(actLower),
        );
      });
    }

    const hasTravelTips = (dest.travelTips ?? []).length > 0;
    const hasReviews = (reviewCountMap.get(day.destinationId) ?? 0) > 0;

    if (!hasTravelTips && !hasReviews) {
      day.tips = [];
    }
  }

  output.warnings = Array.from(warnings);
  return output;
};

/**
 * Validates and enforces comparison data grounding:
 * 1. Checks that at least 2 destinations are present for comparison.
 * 2. Cross-validates recommendation against the researched destination names.
 */
export const validateAndEnforceComparisonGrounding = (
  output: ComparisonOutput,
): ComparisonOutput => {
  if (output.status === "invalid_request" || output.status === "unavailable") {
    return output;
  }

  if (!output.destinations || output.destinations.length < 2) {
    output.status = "unavailable";
    output.message =
      output.message ||
      "Destino requires at least 2 verified destinations to compare.";
    return output;
  }

  const validDestNames = output.destinations.map((d) => d.name);

  const matchDestinationName = (candidateName?: string): string | null => {
    if (!candidateName) return null;
    const trimmed = candidateName.trim().toLowerCase();

    // Exact match (case-insensitive)
    const exact = validDestNames.find((name) => name.toLowerCase() === trimmed);
    if (exact) return exact;

    // Substring or prefix match (e.g. "Hampi" matches "Hampi, Karnataka")
    const partial = validDestNames.find(
      (name) =>
        name.toLowerCase().includes(trimmed) ||
        trimmed.includes(name.toLowerCase()),
    );
    return partial || null;
  };

  if (output.recommendation) {
    const matchedRec = matchDestinationName(output.recommendation);
    if (matchedRec) {
      output.recommendation = matchedRec;
    } else {
      // Recommendation does not match any researched destination
      output.recommendation = validDestNames[0];
      output.recommendationReason =
        (output.recommendationReason ? output.recommendationReason + " " : "") +
        `[Note: Grounded recommendation to researched destination ${validDestNames[0]}].`;
    }
  }

  return output;
};
