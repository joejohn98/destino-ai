import type { Request, Response, RequestHandler } from "express";

import { catchAsync } from "../utils/catchAsync";
import continentService from "../services/continent.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import { uploadImageStream } from "../services/cloudinary.service";
import z from "zod";
import { createContinentSchema, updateContinentSchema } from "../validators/continent.validators";


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
    const parsed = createContinentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
      return;
    }

    let { name, description, imageUrl } = parsed.data;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    }

    if (!name || !imageUrl) {
      throw new AppError("Missing required fields (name and imageUrl/image are required)", 400);
    }

    const payload: { name: string; imageUrl: string; description?: string } = {
      name,
      imageUrl,
    };
    if (description) {
      payload.description = description;
    }

    const continent = await continentService.createContinent(payload);

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
    
    const parsed = updateContinentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
      return;
    }

    let { name, description, imageUrl } = parsed.data;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "continents");
      imageUrl = uploadRes.url;
    }

    if (!isValidObjectId(id)) throw new AppError("Invalid Continent ID", 400);

    const updatePayload: { name?: string; description?: string; imageUrl?: string } = {};
    if (name) updatePayload.name = name;
    if (description) updatePayload.description = description;
    if (imageUrl) updatePayload.imageUrl = imageUrl;

    const continent = await continentService.updateContinent(id, updatePayload);

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
