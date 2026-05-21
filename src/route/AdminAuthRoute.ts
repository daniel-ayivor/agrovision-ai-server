import express from "express";

import { protect } from "../middleware//Middleware";
import { adminOnly } from "../middleware/MiddlewareAdmin";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  adminOnly,
  (req, res) => {
    res.json({
      message: "Welcome Admin"
    });
  }
);

export default router;