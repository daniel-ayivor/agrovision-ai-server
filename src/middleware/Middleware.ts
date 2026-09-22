// backend/middleware/Middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../model/Auth"; // Ensure your Mongoose model path is correct

// 1. We define and export it right here. No import needed!
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const userRecord = await User.findById(decoded.id).select("-password");
    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = userRecord;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};


export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("--- AUTHORIZE DEBUG ---");
    console.log("req.user object:", req.user);
    console.log("req.user.role value:", req.user?.role, "(Type:", typeof req.user?.role, ")");
    console.log("Allowed roles passed:", allowedRoles);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized, no user found" });
    }

    const userRole = typeof req.user.role === 'string' ? req.user.role.toLowerCase().trim() : String(req.user.role).toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());

    console.log("Normalized userRole:", userRole);
    console.log("Normalized allowedRoles:", normalizedAllowedRoles);
    console.log("Includes check:", normalizedAllowedRoles.includes(userRole));

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};

// // Role-based authorization middleware
// export const authorize = (...allowedRoles: string[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Not authorized, no user found" });
//     }

//     // Normalize the user's role (lowercase + trim)
//     const userRole = req.user.role?.toLowerCase()?.trim();
    
//     // Normalize allowed roles as well
//     const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());

//     if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
//       return res.status(403).json({ 
//         success: false, 
//         message: `Role '${req.user.role}' is not authorized to access this route` 
//       });
//     }

//     next();
//   };
// };