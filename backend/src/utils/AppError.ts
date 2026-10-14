export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public cause?: unknown;

  constructor(message: string, statusCode: number, cause?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    if (cause !== undefined) {
      this.cause = cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
