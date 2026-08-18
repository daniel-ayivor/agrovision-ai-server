import { Request, Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import Scan from "../model/Model";
import axios from "axios";
import FormData from "form-data";




export const createScan = async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "No image payload provided" });
    }


    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // ====================================
    // CONSTRUCT MULTIPART FORM-DATA FOR FASTAPI
    // ====================================
    const form = new FormData();
    // 'file' matches the route definition: file: UploadFile = File(...)
    form.append("file", imageBuffer, {
      filename: `scan_${Date.now()}.jpg`,
      contentType: "image/jpeg",
    });

    // ====================================
    // SAFELY COMPOSE TARGET URL
    // ====================================
    // Strip trailing slashes from the base URL, then explicitly hardcode the exact endpoint path
    const aiBaseUrl = process.env.AI_API_URL?.replace(/\/$/, "");
    const targetUrl = `${aiBaseUrl}/predict/`; 

    // ====================================
    // SEND FILE BINARY TO FASTAPI
    // ====================================
    const aiResponse = await axios.post(targetUrl, form, {
      headers: {
        ...form.getHeaders(), // Required to inject boundary headers
      },
      timeout: 90000, // Safe window for handling Render cold starts
    });

    const predictionData = aiResponse.data;

    // ====================================
    // PARSE & SAVE TO DATABASE
    // ====================================
    // Match keys directly to your FastAPI JSON response objects:
    const identifiedDisease = predictionData.predicted_disease || "Unknown";
    
    // Extract crop token (e.g. 'tomato_early_blight' -> 'Tomato')
    const inferredCrop = identifiedDisease.split("_")[0];
    const cleanCropName = inferredCrop.charAt(0).toUpperCase() + inferredCrop.slice(1);

    // Human-readable transformation (e.g., 'tomato_early_blight' -> 'Tomato Early Blight')
    const readablePrediction = identifiedDisease
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char: string) => char.toUpperCase());

    const scan = await Scan.create({
      user: req.user.id,
      image,
      crop: cleanCropName,
      prediction: readablePrediction, 
      confidence: predictionData.confidence, // Saves the rounded percentage float directly
    });

    res.status(201).json({
      success: true,
      scan,
      ai: predictionData,
    });

  } catch (error: any) {
    console.error("FastAPI Target Error Logs:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "AI Processing Failed",
      details: error.response?.data || error.message,
    });
  }
};

// ====================================
// GET MY SCANS
// ====================================
export const getMyScans = async (req: AuthRequest, res: Response) => {
  try {
    const scans = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, scans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// GET SINGLE SCAN
// ====================================
export const getSingleScan = async (req: Request, res: Response) => {
  try {
    const scan = await Scan.findById(req.params.id).populate("user", "name email");
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }
    res.status(200).json({ success: true, scan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ====================================
// DELETE SCAN
// ====================================
export const deleteScan = async (req: Request, res: Response) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }
    await scan.deleteOne();
    res.status(200).json({ success: true, message: "Scan deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

