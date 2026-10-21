import mongoose from "mongoose";
import {
  comparisonSchema,
  COMPARISON_SYSTEM,
  COMPARISON_TOOLS_ORDER,
  comparisonTools,
} from "../agents/comparison.agent";
import {
  ItineraryOutput,
  itinerarySchema,
  PLANNER_SYSTEM,
  PLANNER_TOOL_ORDER,
  plannerTools,
} from "../agents/planner.agent";
import { Destination } from "../models/Destination.model";
import { Review } from "../models/Review.model";
import { AppError } from "../utils/AppError";
import { loadAiSdk } from "../utils/ai-sdk";

const enforceAttractionGrounding = async (output: ItineraryOutput) => {
  if (output.status !== "success" || !output.days || output.days.length === 0) {
    return output;
  }

  const destinationIds = [
    ...new Set(
      output.days
        .map((d) => d.destinationId)
        .filter((id): id is string => Boolean(id) && mongoose.isValidObjectId(id)),
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

const planItinerary = async (query: string) => {
  // Pre-check for explicit out-of-bounds duration or travellers
  const durationMatch = query.match(/\b(\d+)\s*[-_]?\s*(?:days?|day)\b/i);
  if (durationMatch?.[1]) {
    const days = parseInt(durationMatch[1], 10);
    if (days > 30) {
      return {
        output: {
          status: "invalid_request" as const,
          message: `Trip duration cannot exceed 30 days. You requested ${days} days.`,
          durationDays: days,
        },
        steps: [],
        usage: { totalTokens: 0 },
      };
    }
  }

  const travellersMatch = query.match(
    /\b(\d+)\s*[-_]?\s*(?:travellers?|travelers?|people|persons?|guests?)\b/i,
  );
  if (travellersMatch?.[1]) {
    const count = parseInt(travellersMatch[1], 10);
    if (count > 20) {
      return {
        output: {
          status: "invalid_request" as const,
          message: `Group size cannot exceed 20 travellers. You requested ${count} travellers.`,
          travellers: count,
        },
        steps: [],
        usage: { totalTokens: 0 },
      };
    }
  }

  const { ToolLoopAgent, Output, google, isStepCount } = await loadAiSdk();

  const agent = new ToolLoopAgent({
    id: "destino-travel-planner",
    model: google("gemini-3.5-flash-lite"),
    instructions: PLANNER_SYSTEM,
    tools: plannerTools,
    stopWhen: isStepCount(10),
    toolOrder: PLANNER_TOOL_ORDER,
    output: Output.object({
      schema: itinerarySchema,
    }),
    onStepEnd: ({ stepNumber, toolCalls }) => {
      const toolsUsed = toolCalls?.map((toolCall) => toolCall.toolName) ?? [];
      console.log(
        `[Planner] Step ${stepNumber + 1} - tools: ${
          toolsUsed.join(", ") || "none"
        }`,
      );
    },
    maxRetries: 2,
    temperature: 0.2,
  });

  try {
    const result = await agent.generate({
      prompt: query,
    });

    if (!result.output) {
      throw new AppError(
        "The planner did not return a valid structured itinerary",
        502,
      );
    }

    await enforceAttractionGrounding(result.output);

    if (result.output.durationDays && result.output.durationDays > 30) {
      result.output.status = "invalid_request";
      result.output.message = `Trip duration cannot exceed 30 days. You requested ${result.output.durationDays} days.`;
    }

    if (result.output.travellers && result.output.travellers > 20) {
      result.output.status = "invalid_request";
      result.output.message = `Group size cannot exceed 20 travellers. You requested ${result.output.travellers} travellers.`;
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Unable to generate the travel itinerary", 502, error);
  }
};

const compareDestinations = async (query: string) => {
  const { ToolLoopAgent, Output, google, isStepCount } = await loadAiSdk();

  const comparisonAgent = new ToolLoopAgent({
    id: "destino-travel-comparison",
    model: google("gemini-3.5-flash-lite"),
    instructions: COMPARISON_SYSTEM,
    tools: comparisonTools,
    stopWhen: isStepCount(10),
    toolOrder: COMPARISON_TOOLS_ORDER,
    output: Output.object({
      schema: comparisonSchema,
    }),
    onStepEnd: ({ stepNumber, toolCalls }) => {
      const toolsUsed = toolCalls?.map((toolCall) => toolCall.toolName) ?? [];
      console.log(
        `[Comparison] Step ${stepNumber + 1} - tools: ${
          toolsUsed.join(", ") || "none"
        }`,
      );
    },
    maxRetries: 2,
    temperature: 0.2,
  });

  try {
    const result = await comparisonAgent.generate({
      prompt: query,
    });

    if (!result.output) {
      throw new AppError(
        "The comparison agent did not return a valid structured comparison",
        502,
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Unable to compare the destinations", 502, error);
  }
};

export default {
  planItinerary,
  compareDestinations,
};
