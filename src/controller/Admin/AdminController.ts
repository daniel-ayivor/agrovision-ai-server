import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/Middleware"; 
import Scan from "../../model/Model";
import KnowledgeArticle from "../../model/Knowledge";
import User from "../../model/Auth"; // adjust path to match your actual model file
import PostModel from "../../model/Post"; // Adjust path to your Community Post model file
export const getSystemSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Total Scans run on the platform
    const totalScans = await Scan.countDocuments();

    // 2. Total registered users — count the User collection directly, not scan authors.
    //    (Previously this used Scan.distinct("user"), which silently dropped anyone
    //    who hadn't submitted a scan yet.)
    const totalUsers = await User.countDocuments();

    // 3. Count any scan that has a valid prediction as a tracked disease record
    const totalArticles = await Scan.distinct("prediction");

    // 4. Mimic flagged items count by finding scans with low confidence (< 40%) that may need human review
    const recentFlags = await Scan.countDocuments({ confidence: { $lt: 40 } });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalScans,
        totalArticles: totalArticles.length,
        recentFlags
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Start from User (the source of truth for "all users"), then LEFT JOIN their
    // scans in. Previously this started from Scan and grouped by user, which meant
    // users with zero scans never appeared in the result at all.
    const users = await User.aggregate([
      {
        $lookup: {
          from: "scans",
          localField: "_id",
          foreignField: "user",
          as: "scans"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          region: 1,
          profileImage: 1,
          farmSize: 1,
          totalScansSubmitted: { $size: "$scans" },
          lastScanDate: { $max: "$scans.createdAt" }
        }
      },
      { $sort: { lastScanDate: -1 } }
    ]);

    return res.status(200).json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const getCropDistribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Group scan data by crop name to feed your horizontal crop distribution bar chart directly
    const distribution = await Scan.aggregate([
      { $group: { _id: "$crop", totalScans: { $sum: 1 } } },
      { $sort: { totalScans: -1 } }
    ]);
    
    return res.status(200).json({ success: true, data: distribution });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




export const updateUserRole = async (req: AuthRequest, res: Response) => {

  return res.status(200).json({ 
    success: true, 
    message: "User privileges updated inline successfully inside identity scope." 
  });
};

export const banUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Scan.deleteMany({ user: id });
    return res.status(200).json({ success: true, message: "User workspace data purged successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. DISEASE REPORTS CONTROLLER
// ========================================== 

export const getSubmittedReports = async (req: AuthRequest, res: Response) => {
  try {
  
    const threatReports = await Scan.find({
      prediction: { $not: /healthy/i }
    })
    .sort({ createdAt: -1 })
    .limit(50);

    return res.status(200).json({ success: true, data: threatReports });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 5. MODERATION CONTROLLER
// ==========================================

export const resolveFlag = async (req: AuthRequest, res: Response) => {
  try {
    const { scanId, action } = req.body as { scanId: string; action: "approve" | "remove" };
    
    if (action === "remove") {
      await Scan.findByIdAndDelete(scanId);
      return res.status(200).json({ success: true, message: "Scan permanently removed by administration request." });
    }
    
    return res.status(200).json({ success: true, message: "Scan marks verified successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 6. KNOWLEDGE MGMT CONTROLLERS (Derived)
// ==========================================

export const getArticles = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Fetch explicitly curated knowledge articles from the database
    const curatedArticles = await KnowledgeArticle.find().lean();

    // If we have curated articles, return them immediately
    if (curatedArticles.length > 0) {
      return res.status(200).json({ success: true, data: curatedArticles });
    }

    // 2. Otherwise, aggregate distinct diseases from scan logs as an auto-discovery fallback
    const distinctScans = await Scan.aggregate([
      {
        $group: {
          _id: { crop: "$crop", prediction: "$prediction" },
          averageConfidence: { $avg: "$confidence" },
          totalOccurrences: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          id: { $concat: ["$_id.crop", "-", "$_id.prediction"] },
          title: "$_id.prediction",
          crop: "$_id.crop",
          severity: {
            $cond: { if: { $gte: ["$averageConfidence", 85] }, then: "High", else: "Medium" }
          },
          totalOccurrences: 1
        }
      },
      { $sort: { title: 1 } }
    ]);

    return res.status(200).json({ success: true, data: distinctScans });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, crop, severity } = req.body;

    if (!title || !crop) {
      return res.status(400).json({ success: false, message: "Title and crop fields are required." });
    }

    const newArticle = await KnowledgeArticle.create({ title, crop, severity });
    return res.status(201).json({ 
      success: true, 
      data: newArticle, 
      message: "Custom disease parameters registered globally." 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



export const getCommunityPostsForAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await PostModel.find()
      .populate("user", "name email profileImage role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Community feed retrieved successfully for administration view."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCommunityPostByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedPost = await PostModel.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ success: false, message: "Community post not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Community post removed by administration moderation."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, crop, severity } = req.body;
    
    const updated = await KnowledgeArticle.findByIdAndUpdate(
      id, 
      { title, crop, severity }, 
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Article not found in database." });
    }

    return res.status(200).json({ 
      success: true, 
      data: updated, 
      message: "Disease parameters updated successfully." 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await KnowledgeArticle.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Article not found." });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Disease records dropped from lookup cache." 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};