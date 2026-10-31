import type { RequestHandler, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import countryService from "../services/country.service";
import { AppError } from "../utils/AppError";
import { isValidObjectId } from "../utils/validation";
import { uploadImageStream, uploadUrlToCloudinary } from "../services/cloudinary.service";
import { CreateCountryInput, UpdateCountryInput } from "../validators/country.validators";

export const getAllCountries: RequestHandler = catchAsync(async (_req, res) => {
  const continentId = _req.params.continentId as string;

  if (!isValidObjectId(continentId)) {
    throw new AppError("Invalid continent ID", 400);
  }

  const countries = await countryService.getAllCountries(continentId);
  res.status(200).json({
    status: "success",
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
    status: "success",
    message: "Country fetched successfully",
    data: country,
  });
});

export const createCountry: RequestHandler = catchAsync(async (req, res) => {
  const continentId = req.params.continentId as string;

  if (!isValidObjectId(continentId)) {
    throw new AppError("Invalid continent ID", 400);
  }

  let { name, description } = req.body;
  let imageUrl: string | undefined = req.body.imageUrl;

  if (!req.file && !imageUrl) {
    throw new AppError(
      "An image is required (either upload a file or provide an imageUrl)",
      400,
    );
  }

  if (req.file) {
    const uploadRes = await uploadImageStream(req.file.buffer, "countries");
    imageUrl = uploadRes.url;
  } else if (imageUrl) {
    // User-supplied URL image — re-host on Cloudinary instead of storing the raw URL.
    const uploaded = await uploadUrlToCloudinary(imageUrl, "countries", "imageUrl");
    imageUrl = uploaded.url;
  }

  const countryData: CreateCountryInput = { name, imageUrl: imageUrl! };
  if (description !== undefined) {
    countryData.description = description;
  }

  const country = await countryService.createCountry(continentId, countryData);
  res.status(201).json({
    status: "success",
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

    let { name, description } = req.body;
    let imageUrl: string | undefined = req.body.imageUrl;

    if (req.file) {
      const uploadRes = await uploadImageStream(req.file.buffer, "countries");
      imageUrl = uploadRes.url;
    } else if (imageUrl) {
      // User-supplied URL image — re-host on Cloudinary instead of storing the raw URL.
      const uploaded = await uploadUrlToCloudinary(imageUrl, "countries", "imageUrl");
      imageUrl = uploaded.url;
    }

    const updateData: UpdateCountryInput = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedCountry = await countryService.updateCountry(id, updateData);
    res.status(200).json({
      status: "success",
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
      status: "success",
      message: "Country deleted successfully",
    });
  },
);
