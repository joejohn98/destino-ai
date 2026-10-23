import mongoose from "mongoose";
import { config } from "../config/config";

const connectDB = async () => {
  await mongoose.connect(config.mongodbURI);
  console.log("Connected to MongoDB");
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

export default connectDB;
