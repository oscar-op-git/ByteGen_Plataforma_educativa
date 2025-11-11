import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", {
      status,
      message,
      stack: err.stack,
      ...err
    });
  }

  res.status(status).json({ 
    error: true,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}