import type { Request, Response, RequestHandler } from "express";

import { catchAsync } from "../utils/catchAsync";
import continentService from "../services/continent.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import { uploadImageStream } from "../services/cloudinary.service";


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
    let { name, description, imageUrl } = req.body;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    }

    if (!name || !imageUrl) {
      throw new AppError("Missing required fields (name and imageUrl/image are required)", 400);
    }

    const continent = await continentService.createContinent({
      name,
      description,
      imageUrl,
    });

    res.status(201).json({
      status: "success",
      data: {
        continent,
      },
    });
  },
);

export const updateContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    let { name, description, imageUrl } = req.body;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    }

    if (!name && !description && !imageUrl) {
      throw new AppError("Nothing to update", 400);
    }

    if (!isValidObjectId(id)) throw new AppError("Invalid Continent ID", 400);

    const continent = await continentService.updateContinent(id, {
      name,
      description,
      imageUrl
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
    const id = req.params.id as string;

    if (!isValidObjectId(id)) throw new AppError("Invalid Continent ID", 400);

    await continentService.deleteContinent(id);

    res.status(204).json({
      status: "success",
      message: "Continent deleted successfully",
    });
  },
);
