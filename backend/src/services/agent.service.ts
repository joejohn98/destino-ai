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
import { classifyAgentError } from "./agent-error.service";
import { AgentError } from "../utils/AgentError";
import { loadAiSdk } from "../utils/ai-sdk";

const PLANNER_ERROR_CONTEXT = {
  agent: "itinerary_planner",
  operation: "generate_itinerary",
} as const;

const COMPARISON_ERROR_CONTEXT = {
  agent: "destination_comparison",
  operation: "compare_destinations",
} as const;

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

  let sdk: Awaited<ReturnType<typeof loadAiSdk>> | undefined;
  try {
    sdk = await loadAiSdk();
    const { ToolLoopAgent, Output, google, isStepCount } = sdk;
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

    const result = await agent.generate({ prompt: query });

    if (!result.output) {
      const stepLimitReached = result.steps.length >= 10;
      throw new AgentError({
        code: stepLimitReached
          ? "AGENT_STEP_LIMIT_REACHED"
          : "AI_OUTPUT_MISSING",
        message: stepLimitReached
          ? "This request was too complex to complete. Try a shorter or more specific itinerary request."
          : "The planner could not produce a usable itinerary. Please try again.",
        statusCode: stepLimitReached ? 422 : 502,
        context: PLANNER_ERROR_CONTEXT,
        retryable: !stepLimitReached,
      });
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
    if (error instanceof AgentError) {
      throw error;
    }
    throw classifyAgentError(error, PLANNER_ERROR_CONTEXT, sdk);
  }
};

// ─── Agent 2: Destination Comparison Agent ───────────────────────────────────

const compareDestinations = async (query: string) => {
  let sdk: Awaited<ReturnType<typeof loadAiSdk>> | undefined;
  try {
    sdk = await loadAiSdk();
    const { ToolLoopAgent, Output, google, isStepCount } = sdk;
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

    const result = await comparisonAgent.generate({ prompt: query });

    if (!result.output) {
      const stepLimitReached = result.steps.length >= 10;
      throw new AgentError({
        code: stepLimitReached
          ? "AGENT_STEP_LIMIT_REACHED"
          : "AI_OUTPUT_MISSING",
        message: stepLimitReached
          ? "This comparison was too complex to complete. Try a shorter or more specific request."
          : "The comparison agent could not produce a usable result. Please try again.",
        statusCode: stepLimitReached ? 422 : 502,
        context: COMPARISON_ERROR_CONTEXT,
        retryable: !stepLimitReached,
      });
    }

    validateAndEnforceComparisonGrounding(result.output);

    return result;
  } catch (error) {
    if (error instanceof AgentError) {
      throw error;
    }
    throw classifyAgentError(error, COMPARISON_ERROR_CONTEXT, sdk);
  }
};

export default {
  planItinerary,
  compareDestinations,
};
