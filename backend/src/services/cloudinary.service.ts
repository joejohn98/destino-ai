import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { AppError } from "../utils/AppError";

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a single image buffer to Cloudinary via stream
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
