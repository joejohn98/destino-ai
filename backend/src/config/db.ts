import mongoose from "mongoose";
import { config } from "../config/config";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbURI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("Failed to connect to MongoDB:", reason);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

export default connectDB;
