import {
  COMPARISON_SYSTEM,
  COMPARISON_TOOLS_ORDER,
  comparisonSchema,
  comparisonTools,
} from "../agents/comparison.agent";
import {
  itinerarySchema,
  PLANNER_SYSTEM,
  PLANNER_TOOL_ORDER,
  plannerTools,
} from "../agents/planner.agent";
import { AppError } from "../utils/AppError";
import { loadAiSdk } from "../utils/ai-sdk";

const planItinerary = async (query: string) => {
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
      const toolsUsed = toolCalls?.map((tc) => tc.toolName) ?? [];
      console.log(
        `[Comparison] Step ${stepNumber + 1} — tools: ${
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

  const agent = new ToolLoopAgent({
    id: "destino-travel-comparison-agent",
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
        `[Comparison] Step ${stepNumber + 1} — tools: ${
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
        "The Comparison Agent did not return a valid structured comparison",
        502,
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Unable to generate the travel comparison", 502, error);
  }
};

export default {
  planItinerary,
  compareDestinations,
};
