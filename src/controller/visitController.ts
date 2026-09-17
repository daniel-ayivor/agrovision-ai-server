import { Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import FarmVisit from "../model/visitModel"; // Make sure path matches your model structure

// ====================================
// 1. SCHEDULE A VISIT (Officer or Admin)
// ====================================
export const scheduleVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, scheduledDate, notes } = req.body;

    if (!farmerId || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Farmer ID and scheduled date are required" 
      });
    }

    const visit = await FarmVisit.create({
      officer: req.user.id, // The logged-in officer scheduling it
      farmer: farmerId,
      scheduledDate: new Date(scheduledDate),
      visitNotes: notes || "",
      status: "scheduled"
    });

    const populatedVisit = await FarmVisit.findById(visit._id)
      .populate("farmer", "name email region farmSize")
      .populate("officer", "name email");

    return res.status(201).json({
      success: true,
      message: "Farm visit scheduled successfully",
      visit: populatedVisit,
    });
  } catch (error: any) {
    console.error("Schedule Visit Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// 2. LOG VISIT RECORDS / COMPLETE VISIT (Officer)
// ====================================
export const updateVisitRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, visitNotes, recommendations, nextVisitDate } = req.body;

    const visit = await FarmVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: "Visit record not found" });
    }

    // Ensure only the assigned officer or an admin can update record notes
    if (visit.officer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to update this visit record" 
      });
    }

    visit.status = status || visit.status;
    visit.visitNotes = visitNotes !== undefined ? visitNotes : visit.visitNotes;
    visit.recommendations = recommendations !== undefined ? recommendations : visit.recommendations;
    visit.nextVisitDate = nextVisitDate ? new Date(nextVisitDate) : visit.nextVisitDate;

    await visit.save();

    const updatedVisit = await FarmVisit.findById(visit._id)
      .populate("farmer", "name email region")
      .populate("officer", "name email");

    return res.status(200).json({
      success: true,
      message: "Visit record updated successfully",
      visit: updatedVisit,
    });
  } catch (error: any) {
    console.error("Update Visit Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// 3. GET VISITS (Role-Aware: Farmer, Officer, or Admin)
// ====================================
export const getMyVisits = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};

    // If logged in as a farmer, show visits assigned to them
    if (req.user.role === "farmer") {
      query = { farmer: req.user.id };
    } 
    // If logged in as an agricultural officer, show visits they are conducting
    else if (req.user.role === "agricultural_officer") {
      query = { officer: req.user.id };
    }
    // If admin, they see all visits by default (or can query parameters)

    const visits = await FarmVisit.find(query)
      .populate("farmer", "name email region farmSize")
      .populate("officer", "name email")
      .sort({ scheduledDate: -1 });

    return res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error: any) {
    console.error("Get Visits Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// 4. ADMIN: GET ALL SYSTEM RECORDS & SCHEDULES
// ====================================
export const getAllVisitsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // Optional filter by status or region if passed via query params
    const { status, officerId } = req.query;
    let filter: any = {};

    if (status) filter.status = status;
    if (officerId) filter.officer = officerId;

    const visits = await FarmVisit.find(filter)
      .populate("farmer", "name email region farmSize")
      .populate("officer", "name email")
      .sort({ scheduledDate: -1 });

    return res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error: any) {
    console.error("Admin Get Visits Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// 5. DELETE VISIT RECORD (Admin or Owning Officer)
// ====================================
export const deleteVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const visit = await FarmVisit.findById(id);

    if (!visit) {
      return res.status(404).json({ success: false, message: "Visit record not found" });
    }

    if (visit.officer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await visit.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Visit record deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Visit Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};