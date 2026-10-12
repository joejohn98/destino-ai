import { catchAsync } from "../utils/catchAsync";
import aiService from "../services/ai.service";
import { isValidObjectId } from "../utils/validation";
import { AppError } from "../utils/AppError";

export const generateDestinationTips = catchAsync(async (req, res, next) => {
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
