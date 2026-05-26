import { Request, Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import Scan from "../model/Model";
import axios from "axios";






export const createScan = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const { image } = req.body;

    // ====================================
    // SEND IMAGE TO FASTAPI
    // ====================================

    const aiResponse = await axios.post(

      `${process.env.AI_API_URL}/predict`,

      {
        image
      }
    );

    const predictionData = aiResponse.data;

    // ====================================
    // SAVE TO DATABASE
    // ====================================

    const scan = await Scan.create({

      user: req.user.id,

      image,

      crop: predictionData.crop,

      prediction: predictionData.prediction,

      confidence: predictionData.confidence
    });

    res.status(201).json({

      success: true,

      scan,

      ai: predictionData
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"
    });
  }
};

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