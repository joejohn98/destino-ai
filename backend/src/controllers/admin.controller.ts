import type { RequestHandler } from "express";
import { catchAsync } from "../utils/catchAsync";
import { flushCache } from "../utils/cache";

export const flushCacheHandler: RequestHandler = catchAsync(
  async (_req, res) => {
    await flushCache();
    res.status(200).json({
      status: "success",
      message: "Cache flushed",
    });
  },
);
