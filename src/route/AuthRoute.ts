import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controller/AuthController";
import { protect , authorize} from "../middleware/Middleware";
import { adminOnly } from "../middleware/MiddlewareAdmin";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);
router.delete("/users/delete-account/:id", protect, adminOnly, authorize("admin"), deleteUser);

router.patch("/users/:id/block", protect,adminOnly, authorize("admin"), blockUser);
router.patch("/users/:id/unblock", protect, adminOnly, authorize("admin"), unblockUser);

/**
 * Permanently delete a user account by ID (Admin action).
 */

export default router;