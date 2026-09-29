import type { RequestHandler } from "express";
import destinationService from "../services/destination.service";
import { catchAsync } from "../utils/catchAsync";

/**
 * GET /api/destinations
 * Paginated list of all destinations.
 */
export const getPaginatedDestinations: RequestHandler = catchAsync(
  async (req, res) => {
    const page = parseInt(String(req.query.page || "1"), 10) || 1;
    const rawLimit = parseInt(String(req.query.limit || "12"), 10) || 12;

    const result = await destinationService.getPaginatedDestinations({
      page,
      limit: rawLimit,
    });

    res.status(200).json({
      status: "success",
      results: result.destinations.length,
      totalDestinations: result.totalDestinations,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: result.destinations,
    });
  }
);

/**
 * GET /api/destinations/search
 * Full-text search across name, description, and location.
 */
export const searchDestinations: RequestHandler = catchAsync(
  async (req, res) => {
    const q = String(req.query.q || "");
    const destinations = await destinationService.searchDestinations(q);

    res.status(200).json({
      status: "success",
      results: destinations.length,
      data: destinations,
    });
  }
);

