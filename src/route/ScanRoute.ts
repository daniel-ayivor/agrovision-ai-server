import express from "express";

import {
  createScan,
  getMyScans,
  getSingleScan,
  deleteScan,
  deleteMyScan
} from "../controller/ScanController";

import { protect } from "../middleware/Middleware";

const router = express.Router();

router.post(
  "/",
  protect,
  createScan
);

router.get(
  "/my-scans",
  protect,
  getMyScans
);

router.get(
  "/:id",
  protect,
  getSingleScan
);

router.delete(
  "/:id",
  protect,
  deleteScan
);
router.delete("/scans/:id", protect, deleteMyScan);
export default router;