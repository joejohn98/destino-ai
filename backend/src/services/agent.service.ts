import {
  comparisonSchema,
  COMPARISON_SYSTEM,
  COMPARISON_TOOLS_ORDER,
  comparisonTools,
} from "../agents/comparison.agent";
import {
  itinerarySchema,
  PLANNER_SYSTEM,
  PLANNER_TOOL_ORDER,
  plannerTools,
} from "../agents/planner.agent";
import {
  enforceAttractionGrounding,
  validateAndEnforceComparisonGrounding,
} from "./agent-grounding.service";
import { AppError } from "../utils/AppError";
import { loadAiSdk } from "../utils/ai-sdk";

// ─── Query Bounds Helpers ───────────────────────────────────────────────────

const checkItineraryQueryBounds = (query: string) => {
  const durationMatch = query.match(/\b(\d+)\s*[-_]?\s*(?:days?|day)\b/i);
  if (durationMatch?.[1]) {
    const days = parseInt(durationMatch[1], 10);
    if (days > 30) {
      return {
        status: "invalid_request" as const,
        message: `Trip duration cannot exceed 30 days. You requested ${days} days.`,
        durationDays: days,
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
        status: "invalid_request" as const,
        message: `Group size cannot exceed 20 travellers. You requested ${count} travellers.`,
        travellers: count,
      };
    }
  }

  return null;
};

// ─── Agent 1: Travel Itinerary Planner ───────────────────────────────────────

const planItinerary = async (query: string) => {
  const boundError = checkItineraryQueryBounds(query);
  if (boundError) {
    return {
      output: boundError,
      steps: [],
      usage: { totalTokens: 0 },
    };
  }

  const { ToolLoopAgent, Output, google, isStepCount } = await loadAiSdk();

  const agent = new ToolLoopAgent({
    id: "destino-travel-planner",
    model: google("gemini-3.8-flash"),
    instructions: PLANNER_SYSTEM,
    tools: plannerTools,
    stopWhen: isStepCount(10),
    toolOrder: PLANNER_TOOL_ORDER,
    output: Output.object({
      schema: itinerarySchema,
    }),
    onStepEnd: ({ stepNumber, toolCalls }) => {
      const toolsUsed = toolCalls?.map((tc) => tc.toolName) ?? [];
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
    const result = await agent.generate({ prompt: query });

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

// ─── Agent 2: Destination Comparison Agent ───────────────────────────────────

const compareDestinations = async (query: string) => {
  const { ToolLoopAgent, Output, google, isStepCount } = await loadAiSdk();

  const comparisonAgent = new ToolLoopAgent({
    id: "destino-travel-comparison",
    model: google("gemini-3.8-flash"),
    instructions: COMPARISON_SYSTEM,
    tools: comparisonTools,
    stopWhen: isStepCount(10),
    toolOrder: COMPARISON_TOOLS_ORDER,
    output: Output.object({
      schema: comparisonSchema,
    }),
    onStepEnd: ({ stepNumber, toolCalls }) => {
      const toolsUsed = toolCalls?.map((tc) => tc.toolName) ?? [];
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
    const result = await comparisonAgent.generate({ prompt: query });

    if (!result.output) {
      throw new AppError(
        "The comparison agent did not return a valid structured comparison",
        502,
      );
    }

    validateAndEnforceComparisonGrounding(result.output);

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
