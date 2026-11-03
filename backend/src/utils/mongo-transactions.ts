import mongoose from "mongoose";
import { AppError } from "./AppError";

const isTransactionUnsupportedError = (error: unknown) =>
  error instanceof mongoose.mongo.MongoServerError &&
  error.code === 20 &&
  /transaction numbers are only allowed on a replica set member or mongos/i.test(
    error.message,
  );

export const withMongoTransaction = async <T>(
  operation: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(() => operation(session));
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (isTransactionUnsupportedError(error)) {
      throw new AppError(
        "This delete operation requires MongoDB transactions. Configure a replica set or sharded cluster.",
        503,
        error,
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
