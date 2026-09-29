import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodbURI: process.env.DATABASE_URL as string,
  geminiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY as string,
};
