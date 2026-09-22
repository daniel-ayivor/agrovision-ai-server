import { Router } from "express";
import { 
  scheduleVisit, 
  updateVisitRecord, 
  getMyVisits, 
  getAllVisitsAdmin, 
  deleteVisit,
  farmerRespondToVisit // <-- Make sure to import this
} from "../controller/visitController";
import { protect, authorize } from "../middleware/Middleware";

const router = Router();

// Protected routes (Any logged-in user matching their respective role)
router.get("/my-schedule", protect, getMyVisits);

// ==========================================
// NEW: Farmer Response (Confirm / Reschedule)
// ==========================================
router.put("/:id/respond", protect, authorize("farmer"), farmerRespondToVisit);

// Officer or Admin can schedule
router.post("/", protect, authorize("agricultural_officer", "admin"), scheduleVisit);

// Officer updates records after field visit
router.put("/:id", protect, authorize("agricultural_officer", "admin"), updateVisitRecord);

// Admin-specific complete oversight endpoint
router.get("/admin/all", protect, authorize("admin"), getAllVisitsAdmin);

// Delete record
router.delete("/:id", protect, authorize("agricultural_officer", "admin"), deleteVisit);

export default router;