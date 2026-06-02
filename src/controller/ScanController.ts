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

    // ====================================
    // CONVERT BASE64 TO BINARY BUFFER
    // ====================================
    // Extract raw base64 data by stripping out the metadata prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // ====================================
    // CONSTRUCT MULTIPART FORM-DATA FOR FASTAPI
    // ====================================
    const form = new FormData();
    // 'file' matches the name of the argument in your Python endpoint: file: UploadFile
    form.append("file", imageBuffer, {
      filename: `scan_${Date.now()}.jpg`,
      contentType: "image/jpeg",
    });

    // Clean base URL to remove any trailing slash safely
    const aiBaseUrl = process.env.AI_API_URL?.replace(/\/$/, "");

    // ====================================
    // SEND FILE BINARY TO FASTAPI
    // ====================================
    const aiResponse = await axios.post(`${aiBaseUrl}/predict/`, form, {
      headers: {
        ...form.getHeaders(), // 🎯 Automatically applies the required boundary headers
      },
      timeout: 90000, // Generous time window for Render cold boots
    });

    const predictionData = aiResponse.data;

    // ====================================
    // SAVE TO DATABASE
    // ====================================
    // Safely extract crop names out of class mappings (e.g. 'tomato_early_blight' -> 'Tomato')
    const identifiedDisease = predictionData.predicted_disease || "Unknown";
    const inferredCrop = identifiedDisease.split("_")[0];
    const cleanCropName = inferredCrop.charAt(0).toUpperCase() + inferredCrop.slice(1);

    const scan = await Scan.create({
      user: req.user.id,
      image,
      crop: cleanCropName,
      prediction: identifiedDisease.replace(/_/g, " "), // Clean reading display
      confidence: predictionData.confidence,
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

// export const createScan = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const { image } = req.body;

//     // 1. Clean the base URL to make sure it doesn't end with a slash
//     const aiBaseUrl = process.env.AI_API_URL?.replace(/\/$/, "");

//     // 2. Send precisely to /predict with a generous timeout for cold boots
//     const aiResponse = await axios.post(
//       `${aiBaseUrl}/predict`,
//       { image }, // Sending: { "image": "data:image/jpeg;base64,..." }
//       {
//         timeout: 60000, 
//         headers: {
//           "Content-Type": "application/json",
//         }
//       }
//     );

//     const predictionData = aiResponse.data;

//     // SAVE TO DATABASE
//     const scan = await Scan.create({
//       user: req.user.id,
//       image,
//       crop: predictionData.crop,
//       prediction: predictionData.prediction,
//       confidence: predictionData.confidence
//     });

//     res.status(201).json({
//       success: true,
//       scan,
//       ai: predictionData
//     });

//   } catch (error: any) {
//     console.log("Error details:", error.response?.data || error.message);
//     res.status(error.response?.status || 500).json({
//       success: false,
//       message: error.response?.data || "Server Error"
//     });
//   }
// };

// export const createScan = async (
//   req: AuthRequest,
//   res: Response
// ) => {

//   try {

//     const { image } = req.body;

//     // ====================================
//     // SEND IMAGE TO FASTAPI
//     // ====================================

//     const aiResponse = await axios.post(

//       `${process.env.AI_API_URL}/predict`,

//       {
//         image
//       }
//     );

//     const predictionData = aiResponse.data;

//     // ====================================
//     // SAVE TO DATABASE
//     // ====================================

//     const scan = await Scan.create({

//       user: req.user.id,

//       image,

//       crop: predictionData.crop,

//       prediction: predictionData.prediction,

//       confidence: predictionData.confidence
//     });

//     res.status(201).json({

//       success: true,

//       scan,

//       ai: predictionData
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({

//       success: false,

//       message: "Server Error"
//     });
//   }
// };

// ====================================
// GET MY SCANS
// ====================================

export const getMyScans = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const scans = await Scan.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      scans
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ====================================
// GET SINGLE SCAN
// ====================================

export const getSingleScan = async (
  req: Request,
  res: Response
) => {

  try {

    const scan = await Scan.findById(
      req.params.id
    ).populate(
      "user",
      "name email"
    );

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    res.status(200).json({
      success: true,
      scan
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ====================================
// DELETE SCAN
// ====================================

export const deleteScan = async (
  req: Request,
  res: Response
) => {

  try {

    const scan = await Scan.findById(
      req.params.id
    );

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    await scan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Scan deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};