import { Router } from "express";
import { protect } from "../middleware/Middleware";
import {
  getUserDashboardSummary,
  createCommunityPost,
  getCommunityPosts,
  getUserKnowledgeBase
} from "../controller/User/UserDashboardController";

const router = Router();

// Secure all endpoints below with your token session protection layer
router.use(protect);

// General Dashboard Stats Route
router.get("/dashboard/metrics", getUserDashboardSummary);

// Community Interaction Forum Routes
router.get("/community/feed", getCommunityPosts);
router.post("/community/new-post", createCommunityPost);

// Knowledge Base Resource Center Listing Route
router.get("/knowledge-base/list", getUserKnowledgeBase);

export default router;