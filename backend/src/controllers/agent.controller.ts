import type { Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import agentService from "../services/agent.service";

export const generateItinerary = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.body;

    const itinerary = await agentService.planItinerary(query);

    if (itinerary.output?.status === "invalid_request") {
      res.status(422).json({
        status: "fail",
        message:
          itinerary.output.message ||
          "Requested parameters exceed supported limits",
        data: {
          query,
          result: itinerary.output,
          meta: {
            stepsUsed: itinerary.steps.length,
            totalTokens: itinerary.usage.totalTokens ?? "N/A",
          },
        },
      });
      return;
    }

    if (itinerary.output?.status === "unavailable") {
      res.status(404).json({
        status: "fail",
        message:
          itinerary.output.message ||
          "Requested destination is not available in the database",
        data: {
          query,
          result: itinerary.output,
          meta: {
            stepsUsed: itinerary.steps.length,
            totalTokens: itinerary.usage.totalTokens ?? "N/A",
          },
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
        meta: {
          stepsUsed: itinerary.steps.length,
          totalTokens: itinerary.usage.totalTokens ?? "N/A",
        },
      },
    });
  },
);

export const compareDestinations = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.body;

    const comparison = await agentService.compareDestinations(query);
    if (comparison.output?.status === "invalid_request") {
      res.status(422).json({
        status: "fail",
        message: comparison.output.message || "Requested parameters exceed supported limits",
        data: {
          query,
          result: comparison.output,
          meta: {
            stepsUsed: comparison.steps.length,
            totalTokens: comparison.usage.totalTokens ?? "N/A",
          },
        },
      });
      return;
    }

    if (comparison.output?.status === "unavailable") {
      res.status(404).json({
        status: "fail",
        message:
          comparison.output.message ||
          "One or more requested destinations are not available in the database",
        data: {
          query,
          result: comparison.output,
          meta: {
            stepsUsed: comparison.steps.length,
            totalTokens: comparison.usage.totalTokens ?? "N/A",
          },
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
        meta: {
          stepsUsed: comparison.steps.length,
          totalTokens: comparison.usage.totalTokens ?? "N/A",
        },
      },
    });
  },
);
