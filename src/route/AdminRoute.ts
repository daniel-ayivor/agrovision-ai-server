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
  deleteArticle,
  getCommunityPostsForAdmin,
  deleteCommunityPostByAdmin
} from "../controller/Admin/AdminController";
import { adminOnly } from "../middleware/MiddlewareAdmin";
import { registerAdminUser } from "../controller/AuthController";

const router = Router();

// Layout maps directly matching your routing needs with explicit middleware per route
router.get("/overview", protect, adminOnly, getSystemSummary);
router.post("/auth/register", protect, adminOnly, registerAdminUser);
router.get("/analytics/crop-breakdown", protect, adminOnly, getCropDistribution);
router.get("/users", protect, adminOnly, getAllUsers);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, banUser);
router.get("/reports", protect, adminOnly, getSubmittedReports);
router.post("/moderation/action", protect, resolveFlag);
router.get("/knowledge", protect, getArticles);
router.post("/knowledge", protect, adminOnly, createArticle);
router.put("/knowledge/:id", protect, adminOnly, updateArticle);
router.delete("/knowledge/:id", protect, adminOnly, deleteArticle);

// Community Feed Management Routes for Admins
router.get("/community/feed", protect, adminOnly, getCommunityPostsForAdmin);
router.delete("/community/posts/:id", protect, adminOnly, deleteCommunityPostByAdmin);

export default router;