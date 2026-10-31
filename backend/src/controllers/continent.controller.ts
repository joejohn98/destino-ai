import type { Request, Response, RequestHandler } from "express";

import { catchAsync } from "../utils/catchAsync";
import continentService from "../services/continent.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import { uploadImageStream, uploadUrlToCloudinary } from "../services/cloudinary.service";
import { CreateContinentInput, UpdateContinentInput } from "../validators/continent.validators";

export const getAllContinents: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Get all continents
    const continents = await continentService.getAllContinents();

    // Send response
    res.status(200).json({
      status: "success",
      message: "Continents fetched successfully",
      results: continents.length,
      data: continents,
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
      message: "Continent fetched successfully",
      data: continent,
    });
  },
);

export const createContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    let { name, description } = req.body;
    let imageUrl: string | undefined = req.body.imageUrl;

    if (!req.file && !imageUrl) {
      throw new AppError(
        "An image is required (either upload a file or provide an imageUrl)",
        400,
      );
    }

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    } else if (imageUrl) {
      // User-supplied URL image — re-host on Cloudinary instead of storing the raw URL.
      const uploaded = await uploadUrlToCloudinary(
        imageUrl,
        "continents",
        "imageUrl",
      );
      imageUrl = uploaded.url;
    }

    const payload: CreateContinentInput = {
      name,
      imageUrl: imageUrl!,
    };
    if (description) {
      payload.description = description;
    }

    const continent = await continentService.createContinent(payload);

    res.status(201).json({
      status: "success",
      message: "Continent created successfully",
      data: continent,
    });
  },
);

export const updateContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) throw new AppError("Invalid Continent ID", 400);

    let { name, description } = req.body;
    let imageUrl: string | undefined = req.body.imageUrl;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    } else if (imageUrl) {
      // User-supplied URL image — re-host on Cloudinary instead of storing the raw URL.
      const uploaded = await uploadUrlToCloudinary(
        imageUrl,
        "continents",
        "imageUrl",
      );
      imageUrl = uploaded.url;
    }

    const updatePayload: UpdateContinentInput = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;

    const continent = await continentService.updateContinent(id, updatePayload);

    res.status(200).json({
      status: "success",
      message: "Continent updated successfully",
      data: continent,
    });
  },
);

export const deleteContinent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) throw new AppError("Invalid Continent ID", 400);

    await continentService.deleteContinent(id);

    res.status(200).json({
      status: "success",
      message: "Continent deleted successfully",
    });
  },
);
