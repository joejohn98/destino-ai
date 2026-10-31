import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { config } from "../config/config";
import { AppError } from "../utils/AppError";

export interface UploadResult {
  url: string;
  publicId: string;
}

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
      return firstSegment?.toLowerCase() === config.cloudinaryCloudName.toLowerCase();
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
  folder: string = "destino"
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
              500
            )
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple image buffers to Cloudinary via streams in parallel
 */
export const uploadMultipleImageStreams = async (
  fileBuffers: Buffer[],
  folder: string = "destino"
): Promise<UploadResult[]> => {
  const uploadPromises = fileBuffers.map((buffer) =>
    uploadImageStream(buffer, folder)
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
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new AppError(
      "Failed to delete image from Cloudinary. Please try again later.",
      500
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
  fieldName: string = "imageUrl"
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
  } catch (error: any) {
    console.error("Cloudinary URL upload error:", error);
    throw new AppError(
      `${fieldName}: Failed to upload image from URL (${error?.message || "invalid image"})`,
      400
    );
  }
};
