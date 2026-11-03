import { catchAsync } from "../utils/catchAsync";
import aiService from "../services/ai.service";
import { isValidObjectId } from "../utils/validation";
import { AppError } from "../utils/AppError";

export const generateDestinationTips = catchAsync(async (req, res, _next) => {
  const destinationId = String(req.params.destinationId);

  if (!isValidObjectId(destinationId)) {
    throw new AppError("Invalid destination ID", 400);
  }

  const tips = await aiService.generateDestinationTips(destinationId);
  res.status(200).json({
    status: "success",
    data: tips,
  });
});

export const generateDestinationSummary = catchAsync(async (req, res) => {
  const destinationId = String(req.params.destinationId);

  if (!isValidObjectId(destinationId)) {
    throw new AppError("Invalid destination ID", 400);
  }

  const summary = await aiService.generateDestinationSummary(destinationId);
  res.status(200).json({
    status: "success",
    data: summary,
  });
});

export const regenerateDestinationSummary = catchAsync(async (req, res) => {
  const destinationId = String(req.params.destinationId);

  if (!isValidObjectId(destinationId)) {
    throw new AppError("Invalid destination ID", 400);
  }

  const summary = await aiService.generateDestinationSummary(
    destinationId,
    true,
  );
  res.status(200).json({
    status: "success",
    data: summary,
  });
});
