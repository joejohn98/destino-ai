import type { RequestHandler } from "express";
import z from "zod";

export const validate = (schema: z.ZodType): RequestHandler => {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: z.flattenError(parsed.error).fieldErrors,
      });
      return;
    }

    req.body = parsed.data;
    next();
  };
};
