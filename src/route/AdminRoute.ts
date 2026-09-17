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
  deleteCommunityPostByAdmin,
  labelUnrecognizedScan,
  getUnrecognizedScansForReview,

} from "../controller/Admin/AdminController";


import { adminOnly } from "../middleware/MiddlewareAdmin";
import { registerAdminUser } from "../controller/AuthController";
import { deleteScanAdmin, getAllScansAdmin, getScanAnalytics } from "../controller/ScanController";

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
router.get("/admin/scans", protect, adminOnly, getAllScansAdmin);
router.delete("/admin/scans/:id", protect, adminOnly, deleteScanAdmin);

// Community Feed Management Routes for Admins
router.get("/community/feed", protect, adminOnly, getCommunityPostsForAdmin);
router.delete("/community/posts/:id", protect, adminOnly, deleteCommunityPostByAdmin);
router.get("/admin/analytics", protect, adminOnly, getScanAnalytics);




// ==========================================
// ADMIN: UNRECOGNIZED SCANS ACTIVE LEARNING PIPELINE
// ==========================================

// 1. Fetch unrecognized scans (defaults to pending items, or filter via ?status=...)
router.get(
  "/admin/unrecognized-scans", 
  protect, 
  adminOnly, 
  getUnrecognizedScansForReview
);

// 2. Update/label an unrecognized scan so it's prepped for model retraining
router.put(
  "/admin/unrecognized-scans/label", 
  protect, 
  adminOnly, 
  labelUnrecognizedScan
);



export default router;