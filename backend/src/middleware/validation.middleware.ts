import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import z from "zod";

export const validate = <Schema extends z.ZodType>(
  schema: Schema,
): RequestHandler<ParamsDictionary, unknown, z.output<Schema>> => {
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
