import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { type ZodType, type ZodError, z } from "zod";
import { AppError } from "../utils/AppError";

type ZodTypeOutput<Schema extends ZodType> = z.output<Schema>;

const flattenErrors = (error: ZodError) => z.flattenError(error).fieldErrors;

export const validate = <Schema extends ZodType>(
  schema: Schema,
): RequestHandler<ParamsDictionary, unknown, ZodTypeOutput<Schema>> => {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: "fail",
        message: parsed.error.issues[0]?.message || "Validation failed",
        errors: flattenErrors(parsed.error),
      });
      return;
    }

    req.body = parsed.data;
    next();
  };
};

/** Convenience helper: parse `req.query` with a Zod schema and throw an AppError on failure. */
export const parseQuery = <Schema extends ZodType>(schema: Schema) => {
  return (query: unknown): z.output<Schema> => {
    const parsed = schema.safeParse(query);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message || "Invalid query parameters",
        400,
      );
    }
    return parsed.data;
  };
};
