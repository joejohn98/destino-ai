import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbURI: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiration: process.env.JWT_EXPIRATION || "7d",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  geminiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || "",
};

// Validate critical secrets in production
if (config.nodeEnv === "production") {
  const missing: string[] = [];
  if (!config.mongodbURI) missing.push("DATABASE_URL");
  if (!config.jwtSecret) missing.push("JWT_SECRET");
  if (missing.length > 0) {
    console.error(
      `FATAL: Missing required environment variables in production: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
}
