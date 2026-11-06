import type { RequestHandler } from "express";
import destinationService from "../services/destination.service";
import { catchAsync, catchAsyncBody } from "../utils/catchAsync";
import { resolveMultipleImageUrls } from "../services/cloudinary.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import type {
  CreateDestinationInput,
  UpdateDestinationInput,
} from "../validators/destination.validators";
import {
  destinationListQuerySchema,
  searchQuerySchema,
} from "../validators/query.validators";
import type {
  CategoryDestinationResponseDTO,
  DestinationArrayResponseDTO,
  PaginatedDestinationResponseDTO,
} from "../dto/destination.dto";
import { parseQuery } from "../middleware/validation.middleware";

const parseDestinationList = parseQuery(destinationListQuerySchema);
const parseSearchQuery = parseQuery(searchQuerySchema);

/**
 * GET /api/destinations
 * Paginated list of all destinations.
 */
export const getPaginatedDestinations: RequestHandler = catchAsync(
  async (req, res) => {
    const { page, limit, q, location, category, minRating } =
      parseDestinationList(req.query);
    const options: Parameters<
      typeof destinationService.getPaginatedDestinations
    >[0] = {
      page,
      limit,
      ...(q ? { search: q } : {}),
      ...(location ? { location } : {}),
      ...(category ? { category } : {}),
      ...(minRating !== undefined ? { minRating } : {}),
    };

    const result = await destinationService.getPaginatedDestinations(options);

    const response: PaginatedDestinationResponseDTO = {
      status: "success",
      results: result.destinations.length,
      totalDestinations: result.totalDestinations,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: result.destinations,
    };
    res.status(200).json(response);
  },
);

/**
 * GET /api/destinations/search
 * Full-text search across name, description, and location.
 */
export const searchDestinations: RequestHandler = catchAsync(
  async (req, res) => {
    const { q } = parseSearchQuery(req.query);

    const destinations = await destinationService.searchDestinations(q);

    const response: DestinationArrayResponseDTO = {
      status: "success",
      results: destinations.length,
      data: destinations,
    };
    res.status(200).json(response);
  },
);

/**
 * GET /api/destinations/location/:location
 * Destinations filtered by city or country (case-insensitive).
 */
export const getDestinationsByLocation: RequestHandler = catchAsync(
  async (req, res) => {
    const rawLoc = String(req.params.location || "");
    const destinations =
      await destinationService.getDestinationsByLocation(rawLoc);

    const response: DestinationArrayResponseDTO = {
      status: "success",
      results: destinations.length,
      data: destinations,
    };
    res.status(200).json(response);
  },
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

    const response: CategoryDestinationResponseDTO = {
      status: "success",
      category,
      results: destinations.length,
      data: destinations,
    };
    res.status(200).json(response);
  },
);

/**
 * GET /api/destinations/continents
 * All continents that have at least one destination, with stats.
 */
export const getContinentStats: RequestHandler = catchAsync(
  async (_req, res) => {
    const stats = await destinationService.getContinentStats();

    res.status(200).json({
      status: "success",
      results: stats.length,
      data: stats,
    });
  },
);

/**
 * GET /api/destinations/continents/:continent/countries
 * Countries within a specific continent with destination count and average rating.
 */
export const getCountriesByContinent: RequestHandler = catchAsync(
  async (req, res) => {
    const rawContinent = String(req.params.continent || "");
    const { continent, countries } =
      await destinationService.getCountriesByContinent(rawContinent);

    res.status(200).json({
      status: "success",
      continent,
      results: countries.length,
      data: countries,
    });
  },
);

/**
 * GET /api/destinations/:name
 * Get a single destination by name (or slug).
 * MUST be registered last in destination.routes.ts!
 * NOTE: Kept for backwards-compat / search result shortcuts only.
 *       Prefer the canonical route below for all navigation links.
 */
export const getDestinationByName: RequestHandler = catchAsync(
  async (req, res) => {
    const rawName = String(req.params.name || "");
    const destination = await destinationService.getDestinationByName(rawName);

    res.status(200).json({
      status: "success",
      data: destination,
    });
  },
);

/**
 * GET /api/countries/:countrySlug/destinations
 * Canonical country destinations endpoint.
 * Returns all verified destinations belonging to the country.
 */
export const getDestinationsByCountrySlug: RequestHandler = catchAsync(
  async (req, res) => {
    const countrySlug = String(req.params.countrySlug || "");
    const result =
      await destinationService.getDestinationsByCountrySlug(countrySlug);

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

/**
 * GET /api/countries/:countrySlug/destinations/:destinationSlug
 * Canonical, unambiguous destination detail endpoint.
 * Resolves via the compound unique index { location.country, slug }
 * so slug collisions across countries are impossible.
 */
export const getDestinationBySlug: RequestHandler = catchAsync(
  async (req, res) => {
    const countrySlug = String(req.params.countrySlug || "");
    const destinationSlug = String(req.params.destinationSlug || "");
    const destination = await destinationService.getDestinationBySlug(
      countrySlug,
      destinationSlug,
    );

    res.status(200).json({
      status: "success",
      data: destination,
    });
  },
);

/**
 * POST /api/destinations
 * Create a new destination (Admin only)
 */
export const createDestination = catchAsyncBody<CreateDestinationInput>(
  async (req, res) => {
    const images = await resolveMultipleImageUrls({
      file: req.file,
      files: req.files,
      imageUrls: req.body.images ?? [],
    });
    req.body.images = images ?? [];

    const destination = await destinationService.createDestination(req.body);

    res.status(201).json({
      status: "success",
      message: "Destination created successfully",
      data: destination,
    });
  },
);

/**
 * PUT /api/destinations/:id
 * Update an existing destination (Admin only)
 */
export const updateDestination = catchAsyncBody<UpdateDestinationInput>(
  async (req, res) => {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      throw new AppError("Invalid Destination ID", 400);
    }

    const resolvedImages = await resolveMultipleImageUrls({
      file: req.file,
      files: req.files,
      imageUrls: req.body.images,
    });
    if (resolvedImages !== undefined) {
      req.body.images = resolvedImages;
    }

    const destination = await destinationService.updateDestination(
      id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Destination updated successfully",
      data: destination,
    });
  },
);

/**
 * DELETE /api/destinations/:id
 * Delete a destination (Admin only)
 */
export const deleteDestination: RequestHandler = catchAsync(
  async (req, res) => {
    const deletedDestination = await destinationService.deleteDestination(
      req.params.id as string,
    );

    res.status(200).json({
      status: "success",
      message: "Destination deleted successfully",
      data: deletedDestination,
    });
  },
);
