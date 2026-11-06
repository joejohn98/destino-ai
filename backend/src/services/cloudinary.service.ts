import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { config } from "../config/config";
import { AppError } from "../utils/AppError";

/** Result of a successful Cloudinary upload. */
export interface UploadResult {
  url: string;
  publicId: string;
}

/** Cloudinary destination folders used across the app. */
export const IMAGE_FOLDERS = {
  continents: "continents",
  countries: "countries",
  destinations: "destinations",
} as const;

/** Is this a Cloudinary URL owned by this account (e.g. a previous upload)? */
export const isOwnCloudinaryUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const isCloudinaryHost =
      parsed.hostname === "res.cloudinary.com" ||
      /^res(?:-[1-5])?\.cloudinary\.com$/i.test(parsed.hostname);

    if (!isCloudinaryHost) {
      return false;
    }

    if (config.cloudinaryCloudName) {
      const firstSegment = parsed.pathname.split("/").filter(Boolean)[0];
      return (
        firstSegment?.toLowerCase() === config.cloudinaryCloudName.toLowerCase()
      );
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Upload a single image buffer to Cloudinary via stream (used for file uploads)
 */
export const uploadImageStream = (
  fileBuffer: Buffer,
  folder: string = "destino",
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(
            new AppError(
              "Cloudinary upload failed. Please try again later.",
              500,
            ),
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple image buffers to Cloudinary via streams in parallel
 */
export const uploadMultipleImageStreams = async (
  fileBuffers: Buffer[],
  folder: string = "destino",
): Promise<UploadResult[]> => {
  const uploadPromises = fileBuffers.map((buffer) =>
    uploadImageStream(buffer, folder),
  );
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary by its public_id
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error: unknown) {
    console.error("Cloudinary delete error:", error);
    throw new AppError(
      "Failed to delete image from Cloudinary. Please try again later.",
      500,
    );
  }
};

/**
 * Re-host a user-supplied external image URL on Cloudinary.
 * Cloudinary fetches the image directly on its servers, validates it, and stores it.
 * If the URL is already an owned Cloudinary URL, it is kept as-is without re-upload.
 */
export const uploadUrlToCloudinary = async (
  rawUrl: string,
  folder: string = "destino",
  fieldName: string = "imageUrl",
): Promise<UploadResult> => {
  const trimmed = rawUrl.trim();

  // Already a Cloudinary URL (e.g. an existing image in the entity). Skip re-upload.
  if (isOwnCloudinaryUrl(trimmed)) {
    return { url: trimmed, publicId: "" };
  }

  try {
    const result = await cloudinary.uploader.upload(trimmed, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: unknown) {
    console.error("Cloudinary URL upload error:", error);
    const message = error instanceof Error ? error.message : "invalid image";
    throw new AppError(
      `${fieldName}: Failed to upload image from URL (${message})`,
      400,
    );
  }
};

/**
 * Resolves a single image target from either an uploaded multer file buffer
 * or a user-provided image URL (which gets re-hosted on Cloudinary).
 */
export const resolveSingleImageUrl = async (
  file: Express.Multer.File | undefined,
  rawImageUrl: string | undefined,
  folder: string = "destino",
  fieldName: string = "imageUrl",
): Promise<string | undefined> => {
  if (file) {
    const uploadRes = await uploadImageStream(file.buffer, folder);
    return uploadRes.url;
  }
  if (rawImageUrl) {
    const uploaded = await uploadUrlToCloudinary(
      rawImageUrl,
      folder,
      fieldName,
    );
    return uploaded.url;
  }
  return undefined;
};

/** Collect buffers from single-file or multi-file multer uploads. */
export const collectMulterBuffers = (
  file?: Express.Multer.File,
  files?:
    Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] },
): Buffer[] => {
  const buffers: Buffer[] = [];
  if (file) buffers.push(file.buffer);
  if (files && Array.isArray(files)) {
    buffers.push(...files.map((f) => f.buffer));
  }
  return buffers;
};

/**
 * Resolves multiple images from either uploaded multer files or user-provided image URLs (rehosted on Cloudinary).
 * Enforces maximum image bounds and prevents duplicate processing.
 */
export const resolveMultipleImageUrls = async ({
  file,
  files,
  imageUrls,
  maxAllowed = 5,
  folder = "destinations",
}: {
  file?: Express.Multer.File | undefined;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  imageUrls?: string[] | string | undefined;
  maxAllowed?: number;
  folder?: string;
}): Promise<string[] | undefined> => {
  const uploadedCount =
    (file ? 1 : 0) + (Array.isArray(files) ? files.length : 0);
  const userUrlCount = imageUrls
    ? Array.isArray(imageUrls)
      ? imageUrls.length
      : 1
    : 0;

  if (userUrlCount + uploadedCount > maxAllowed) {
    throw new AppError(`At most ${maxAllowed} images are allowed`, 400);
  }

  const fileBuffers = collectMulterBuffers(file, files);
  const uploadedFileUrls = fileBuffers.length
    ? (await uploadMultipleImageStreams(fileBuffers, folder)).map(
        (res) => res.url,
      )
    : [];

  if (imageUrls !== undefined) {
    const rawImages = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    const urlImages = rawImages.filter(
      (url: unknown): url is string => typeof url === "string",
    );
    // uploadUrlToCloudinary keeps already-owned Cloudinary URLs as-is
    const rehostedUrls = (
      await Promise.all(
        urlImages.map((url: string) =>
          uploadUrlToCloudinary(url, folder, "images"),
        ),
      )
    ).map((r) => r.url);

    return [...rehostedUrls, ...uploadedFileUrls];
  }

  if (uploadedFileUrls.length > 0) {
    return uploadedFileUrls;
  }

  return undefined;
};
