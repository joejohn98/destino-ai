import type { Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import agentService from "../services/agent.service";

export const generateItinerary = catchAsync(
  async (req: Request, res: Response) => {
    const { query } = req.body;

    if (!query || typeof query !== "string")
      throw new AppError("Please provide a query", 400);

    const itinerary = await agentService.planItinerary(query);

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
