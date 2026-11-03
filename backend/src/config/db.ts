import mongoose from "mongoose";
import { config } from "../config/config";

const connectDB = async () => {
  await mongoose.connect(config.mongodbURI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log("Connected to MongoDB");
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

export default connectDB;
