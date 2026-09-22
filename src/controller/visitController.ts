import { Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import FarmVisit from "../model/visitModel";

// ====================================
// 1. SCHEDULE A VISIT (Officer or Admin)
// ====================================
export const scheduleVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, scheduledDate, visitNotes, notes } = req.body;

    if (!farmerId || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Farmer ID and scheduled date are required" 
      });
    }

    const visit = await FarmVisit.create({
      officer: req.user?._id || req.user?.id, 
      farmer: farmerId,
      scheduledDate: new Date(scheduledDate),
      visitNotes: visitNotes || notes || "",
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
    console.error("Schedule Visit Error Stack:", error);
    return res.status(400).json({ success: false, message: error.message || "Server Error" });
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



// ====================================
// 1. FARMER: VIEW VISIT NOTICES & UPDATES
// ====================================
export const getFarmerVisits = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ success: false, message: "Access denied. Farmers only." });
    }

    const visits = await FarmVisit.find({ farmer: req.user.id })
      .populate("officer", "name email phone")
      .sort({ scheduledDate: -1 });

    return res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error: any) {
    console.error("Farmer Get Visits Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// 2. FARMER: RESPOND TO VISIT NOTICE (Confirm / Request Reschedule)
// ====================================
export const farmerRespondToVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Visit ID
    const { action, proposedNewDate, feedback } = req.body; 
    // action options: "confirm", "reschedule"

    const visit = await FarmVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: "Visit notice not found." });
    }

    // Ensure only the assigned farmer can respond
    if (visit.farmer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    if (action === "confirm") {
      visit.status = "confirmed";
      if (feedback) visit.farmerFeedback = feedback;
    } 
    else if (action === "reschedule") {
      visit.status = "reschedule_requested";
      if (proposedNewDate) {
        // Log the requested new date in feedback or notes for the officer to review
        visit.farmerFeedback = `Reschedule requested for ${new Date(proposedNewDate).toLocaleDateString()}. Reason: ${feedback || "No reason provided"}`;
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid action parameter." });
    }

    await visit.save();

    const updatedVisit = await FarmVisit.findById(visit._id)
      .populate("officer", "name email phone");

    return res.status(200).json({
      success: true,
      message: action === "confirm" ? "Visit confirmed successfully!" : "Reschedule request sent to officer.",
      visit: updatedVisit,
    });
  } catch (error: any) {
    console.error("Farmer Visit Response Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};