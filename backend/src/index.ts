import app from "./app";
import connectDB from "./config/db";
import { disconnectRedis } from "./config/redis";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    await disconnectRedis();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();
