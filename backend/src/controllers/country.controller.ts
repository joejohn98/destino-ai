import type { RequestHandler, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import countryService from "../services/country.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import { uploadImageStream } from "../services/cloudinary.service";

export const getAllCountries: RequestHandler = catchAsync(async (_req, res) => {
  const continentId = _req.params.continentId as string;

  if (!isValidObjectId(continentId)) {
    throw new AppError("Invalid continent ID", 400);
  }

  const countries = await countryService.getAllCountries(continentId);
  res.status(200).json({
    success: true,
    message: "Countries fetched successfully",
    data: countries,
  });
});

export const getCountry: RequestHandler = catchAsync(async (req, res) => {
  const continentId = req.params.continentId as string;
  const slug = req.params.slug as string;

  if (!isValidObjectId(continentId)) {
    throw new AppError("Invalid continent ID", 400);
  }

  const country = await countryService.getCountry(continentId, slug);
  res.status(200).json({
    success: true,
    message: "Country fetched successfully",
    data: country,
  });
});

export const createCountry: RequestHandler = catchAsync(async (req, res) => {
  const continentId = req.params.continentId as string;
  let { name, description, imageUrl } = req.body;

  if (!isValidObjectId(continentId)) {
    throw new AppError("Invalid continent ID", 400);
  }

  if (req.file) {
    const uploadRes = await uploadImageStream(req.file.buffer, "countries");
    imageUrl = uploadRes.url;
  }

  if (!name || !imageUrl) {
    throw new AppError(
      "Missing required fields (name and imageUrl/image are required)",
      400,
    );
  }

  const country = await countryService.createCountry(continentId, {
    name,
    description,
    imageUrl,
  });
  res.status(201).json({
    success: true,
    message: "Country created successfully",
    data: country,
  });
});

export const updateCountry: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      throw new AppError("Invalid country ID", 400);
    }

    let { name, description, imageUrl } = req.body;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "countries");
      imageUrl = uploadRes.url;
    }

    const updatedCountry = await countryService.updateCountry(id, {
      name,
      description,
      imageUrl,
    });
    res.status(200).json({
      success: true,
      message: "Country updated successfully",
      data: updatedCountry,
    });
  },
);

export const deleteCountry: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!isValidObjectId(id)) {
      throw new AppError("Invalid country ID", 400);
    }

    const deletedCountry = await countryService.deleteCountry(id);
    res.status(200).json({
      success: true,
      message: "Country deleted successfully",
      data: deletedCountry,
    });
  },
);
