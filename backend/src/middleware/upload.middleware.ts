import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../utils/AppError";

// Memory storage to process files as buffers directly in RAM before streaming to Cloudinary
const storage = multer.memoryStorage();

// Filter for images only
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files (JPEG, PNG, WEBP, GIF) are allowed!", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export const uploadSingle = (fieldName: string = "image") => upload.single(fieldName);

export const uploadArray = (fieldName: string = "images", maxCount: number = 5) =>
  upload.array(fieldName, maxCount);
