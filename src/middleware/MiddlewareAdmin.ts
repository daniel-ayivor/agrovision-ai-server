// backend/middleware/MiddlewareAdmin.ts
import { Response, NextFunction } from "express";
// Import the custom interface cleanly from the file we just fixed above
import { AuthRequest } from "./Middleware"; 

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }

  next();
};