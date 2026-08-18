import { Router } from "express";
import { protect } from "../middleware/Middleware"; // Adjust paths to your middleware files

import {
  getSystemSummary,
  getCropDistribution,
  getAllUsers,
  updateUserRole,
  banUser,
  getSubmittedReports,
  resolveFlag,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle
} from "../controller/Admin/AdminController";
import { adminOnly } from "../middleware/MiddlewareAdmin";
import { registerAdminUser } from "../controller/AuthController";

const router = Router();

// Secure all admin commands under your existing security tokens
router.use(protect, adminOnly);

// Layout maps directly matching your routing needs
router.get("/overview", getSystemSummary);
router.post("/admin/register", registerAdminUser); // Assuming you have a registerAdmin function in your controller
router.get("/analytics/crop-breakdown", getCropDistribution);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", banUser);
router.get("/reports", getSubmittedReports);
router.post("/moderation/action", resolveFlag);
router.get("/knowledge", getArticles);
router.post("/knowledge", createArticle);
router.put("/knowledge/:id", updateArticle);
router.delete("/knowledge/:id", deleteArticle);

export default router;