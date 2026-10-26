import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbURI: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiration: process.env.JWT_EXPIRATION as string,
  redisUrl: process.env.REDIS_URL as string,
  geminiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  githubClientId: process.env.GITHUB_CLIENT_ID as string,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL as string,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL as string,
};
