import type { Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

/**
 * Wrap an async route handler so rejections are forwarded to Express's
 * error-handling middleware. This type accepts any set of params.
 */
export function catchAsync<P extends ParamsDictionary = ParamsDictionary>(
  fn: RequestHandler<P>,
): RequestHandler<P> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Wrap an async body-handler so rejections are forwarded to Express. */
export function catchAsyncBody<Body>(
  fn: (
    req: Request<ParamsDictionary, unknown, Body>,
    res: Response,
  ) => Promise<unknown>,
): RequestHandler<ParamsDictionary, unknown, Body> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}
