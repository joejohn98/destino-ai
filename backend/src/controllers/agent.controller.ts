import { catchAsyncBody } from "../utils/catchAsync";
import agentService from "../services/agent.service";
import type {
  CompareRequestInput,
  PlanRequestInput,
} from "../validators/ai.validators";

type AgentResult = {
  steps: { length: number };
  usage: { totalTokens: number | undefined };
};

const agentMeta = ({ steps, usage }: AgentResult) => ({
  stepsUsed: steps.length,
  totalTokens: usage.totalTokens ?? "N/A",
});

const agentError = (
  code: "AGENT_INVALID_REQUEST" | "DESTINATION_UNAVAILABLE",
  message: string,
  agent: "itinerary_planner" | "destination_comparison",
  operation: "generate_itinerary" | "compare_destinations",
) => ({
  code,
  message,
  context: { agent, operation },
  retryable: false,
});

export const generateItinerary = catchAsyncBody<PlanRequestInput>(
  async (req, res) => {
    const { query } = req.body;

    const itinerary = await agentService.planItinerary(query);

    if (itinerary.output?.status === "invalid_request") {
      const message =
        itinerary.output.message ||
        "Requested parameters exceed supported limits";
      res.status(422).json({
        status: "fail",
        message,
        error: agentError(
          "AGENT_INVALID_REQUEST",
          message,
          "itinerary_planner",
          "generate_itinerary",
        ),
        data: {
          query,
          result: itinerary.output,
          meta: agentMeta(itinerary),
        },
      });
      return;
    }

    if (itinerary.output?.status === "unavailable") {
      const message =
        itinerary.output.message ||
        "Requested destination is not available in the database";
      res.status(404).json({
        status: "fail",
        message,
        error: agentError(
          "DESTINATION_UNAVAILABLE",
          message,
          "itinerary_planner",
          "generate_itinerary",
        ),
        data: {
          query,
          result: itinerary.output,
          meta: agentMeta(itinerary),
        },
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Itinerary generated successfully",
      data: {
        query,
        itinerary: itinerary.output,
        meta: agentMeta(itinerary),
      },
    });
  },
);

export const compareDestinations = catchAsyncBody<CompareRequestInput>(
  async (req, res) => {
    const { query } = req.body;

    const comparison = await agentService.compareDestinations(query);
    if (comparison.output?.status === "invalid_request") {
      const message =
        comparison.output.message ||
        "Requested parameters exceed supported limits";
      res.status(422).json({
        status: "fail",
        message,
        error: agentError(
          "AGENT_INVALID_REQUEST",
          message,
          "destination_comparison",
          "compare_destinations",
        ),
        data: {
          query,
          result: comparison.output,
          meta: agentMeta(comparison),
        },
      });
      return;
    }

    if (comparison.output?.status === "unavailable") {
      const message =
        comparison.output.message ||
        "One or more requested destinations are not available in the database";
      res.status(404).json({
        status: "fail",
        message,
        error: agentError(
          "DESTINATION_UNAVAILABLE",
          message,
          "destination_comparison",
          "compare_destinations",
        ),
        data: {
          query,
          result: comparison.output,
          meta: agentMeta(comparison),
        },
      });
      return;
    }

    const isPartial = comparison.output?.status === "partial";

    res.status(200).json({
      status: "success",
      message:
        comparison.output?.message ||
        (isPartial
          ? "Destinations compared with partial availability"
          : "Destinations compared successfully"),
      data: {
        query,
        comparison: comparison.output,
        meta: agentMeta(comparison),
      },
    });
  },
);
