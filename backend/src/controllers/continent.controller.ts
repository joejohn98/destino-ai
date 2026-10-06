import type { Request, Response, RequestHandler } from "express";
import { catchAsync } from "../utils/catchAsync";
import continentService from "../services/continent.service";
import { AppError } from "../utils/AppError";

export const getAllContinents: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Get all continents
    const continents = await continentService.getAllContinents();

    // Send response
    res.status(200).json({
      status: "success",
      results: continents.length,
      data: {
        continents,
      },
    });
  },
);

export const getContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Validation
    const slug = req.params.slug as string;
    if (!slug) throw new AppError("No slug found", 400);

    const continent = await continentService.getContinent(slug);

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        continent,
      },
    });
  },
);

export const createContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Validation
    const { name, description, image } = req.body;
    if (!name || !image) throw new AppError("Missing required fields", 400);

    const continent = await continentService.createContinent({
      name,
      description,
      image,
    });

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        continent,
      },
    });
  },
);

export const updateContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { name, description, image } = req.body;

    if (!name && !description && !image)
      throw new AppError("Nothing to update", 400);

    const slug = req.params.slug as string;

    const continent = await continentService.updateContinent(slug, {
      name,
      description,
      image,
    });

    res.status(200).json({
      status: "success",
      message: "Continent updated successfully",
      data: {
        continent,
      },
    });
  },
);

export const deleteContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const slug = req.params.slug as string;

    const _continent = await continentService.deleteContinent(slug);

    res.status(200).json({
      status: "success",
      message: "Continent deleted successfully",
    });
  },
);
