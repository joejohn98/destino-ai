import type { Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

export const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const catchAsyncBody = <Body>(
  fn: (
    req: Request<ParamsDictionary, unknown, Body>,
    res: Response,
  ) => Promise<unknown>,
): RequestHandler<ParamsDictionary, unknown, Body> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
