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

/**
 * GET /api/destinations/location/:location
 * Destinations filtered by city or country (case-insensitive).
 */
export const getDestinationsByLocation: RequestHandler = catchAsync(
  async (req, res) => {
    const rawLoc = String(req.params.location || "");
    const destinations = await destinationService.getDestinationsByLocation(
      rawLoc
    );

    res.status(200).json({
      status: "success",
      results: destinations.length,
      data: destinations,
    });
  }
);

/**
 * GET /api/destinations/rating
 * All destinations sorted by averageRating descending.
 */
export const getDestinationsByRating: RequestHandler = catchAsync(
  async (req, res) => {
    const destinations = await destinationService.getDestinationsByRating();

    res.status(200).json({
      status: "success",
      results: destinations.length,
      data: destinations,
    });
  }
);

/**
 * GET /api/destinations/filter/:minRating
 * Destinations with averageRating >= minRating.
 */
export const getDestinationsByMinRating: RequestHandler = catchAsync(
  async (req, res) => {
    const rawMin = String(req.params.minRating || "");
    const destinations = await destinationService.getDestinationsByMinRating(
      rawMin
    );

    res.status(200).json({
      status: "success",
      results: destinations.length,
      data: destinations,
    });
  }
);


/**
 * GET /api/destinations/category/:category
 * Destinations filtered by category.
 */
export const getDestinationsByCategory: RequestHandler = catchAsync(
  async (req, res) => {
    const rawCat = String(req.params.category || "");
    const { category, destinations } =
      await destinationService.getDestinationsByCategory(rawCat);

    res.status(200).json({
      status: "success",
      category,
      results: destinations.length,
      data: destinations,
    });
  }
);

/**
 * GET /api/destinations/continents
 * All continents that have at least one destination, with stats.
 */
export const getContinentStats: RequestHandler = catchAsync(
  async (req, res) => {
    const stats = await destinationService.getContinentStats();

    res.status(200).json({
      status: "success",
      results: stats.length,
      data: stats,
    });
  }
);
