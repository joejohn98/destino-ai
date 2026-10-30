import type { RequestHandler } from "express";
import destinationService from "../services/destination.service";
import { catchAsync } from "../utils/catchAsync";
import { uploadMultipleImageStreams } from "../services/cloudinary.service";

/**
 * GET /api/destinations
 * Paginated list of all destinations.
 */
export const getPaginatedDestinations: RequestHandler = catchAsync(
  async (req, res) => {
    const page = parseInt(String(req.query.page || "1"), 10) || 1;
    const rawLimit = parseInt(String(req.query.limit || "12"), 10) || 12;
    const options: Parameters<
      typeof destinationService.getPaginatedDestinations
    >[0] = {
      page,
      limit: rawLimit,
    };
    const search = String(req.query.q || "").trim();
    const location = String(req.query.location || "").trim();
    const category = String(req.query.category || "").trim();
    const rawMinRating = req.query.minRating;

    if (search) options.search = search;
    if (location) options.location = location;
    if (category) options.category = category;
    if (rawMinRating !== undefined) options.minRating = Number(rawMinRating);

    const result = await destinationService.getPaginatedDestinations(options);

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
  }
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
  }
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
  }
);

/**
 * POST /api/destinations
 * Create a new destination (Admin only)
 */
export const createDestination: RequestHandler = catchAsync(async (req, res) => {
  let images = req.body.images || [];
  if (typeof images === "string") images = [images];

  let fileBuffers: Buffer[] = [];
  if (req.file) fileBuffers.push(req.file.buffer);
  if (req.files && Array.isArray(req.files)) {
    fileBuffers.push(...req.files.map((f) => f.buffer));
  }

  if (fileBuffers.length > 0) {
    const uploadResults = await uploadMultipleImageStreams(fileBuffers, "destinations");
    const uploadedUrls = uploadResults.map((res) => res.url);
    images = [...images, ...uploadedUrls];
  }

  req.body.images = images;
  const destination = await destinationService.createDestination(req.body);

  res.status(201).json({
    status: "success",
    message: "Destination created successfully",
    data: destination,
  });
});

/**
 * PUT /api/destinations/:id
 * Update an existing destination (Admin only)
 */
export const updateDestination: RequestHandler = catchAsync(async (req, res) => {
  let images = req.body.images;

  if (images !== undefined) {
    if (typeof images === "string") images = [images];
  } else {
    images = []; // Start with an empty array if undefined but files are uploaded
  }

  let fileBuffers: Buffer[] = [];
  if (req.file) fileBuffers.push(req.file.buffer);
  if (req.files && Array.isArray(req.files)) {
    fileBuffers.push(...req.files.map((f) => f.buffer));
  }

  if (fileBuffers.length > 0) {
    const uploadResults = await uploadMultipleImageStreams(fileBuffers, "destinations");
    const uploadedUrls = uploadResults.map((res) => res.url);
    images = [...images, ...uploadedUrls];
  }

  // Only override if we received images in body or files
  if (req.body.images !== undefined || fileBuffers.length > 0) {
    req.body.images = images;
  }

  const destination = await destinationService.updateDestination(req.params.id as string, req.body);

  res.status(200).json({
    status: "success",
    message: "Destination updated successfully",
    data: destination,
  });
});

/**
 * DELETE /api/destinations/:id
 * Delete a destination (Admin only)
 */
export const deleteDestination: RequestHandler = catchAsync(async (req, res) => {
  const deletedDestination = await destinationService.deleteDestination(req.params.id as string);

  res.status(200).json({
    status: "success",
    message: "Destination deleted successfully",
    data: deletedDestination,
  });
});
