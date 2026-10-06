import type { RequestHandler, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import countryService from "../services/country.service";

import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";

export const getAllCountries: RequestHandler = catchAsync(async (_req, res) => {
  const countries = await countryService.getAllCountries();
  res.status(200).json({
    success: true,
    message: "Countries fetched successfully",
    data: countries,
  });
});

export const getCountry: RequestHandler = catchAsync(async (req, res) => {
  const slug = req.params.slug as string;

  const country = await countryService.getCountry(slug);
  res.status(200).json({
    success: true,
    message: "Country fetched successfully",
    data: country,
  });
});

export const createCountry: RequestHandler = catchAsync(async (req, res) => {
  const { name, description, image, continent } = req.body;

  if (!name || !image) throw new AppError("Missing required fields", 400);

  const country = await countryService.createCountry({
    name,
    description,
    image,
    continent,
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

    const { name, description, image, continent } = req.body;

    const updatedCountry = await countryService.updateCountry(id, {
      name,
      description,
      image,
      continent,
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
