import { Response, Request } from "express";

import { AuthRequest } from "../../middleware/Middleware";
import Scan from "../../model/Model";
import Post  from "../../model/Post";
import mongoose from "mongoose";



// ====================================
// 1. DASHBOARD: METRICS & DISTRIBUTION
// ====================================
export const getUserDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch user's recent scans for the summary feed
    const recentScans = await Scan.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("crop prediction confidence createdAt");

    // Aggregate crop scan counts for your "Crop Distribution" charts
    const cropStats = await Scan.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$crop", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Format metrics cleanly for easy frontend integration
    const distributionMap = cropStats.reduce((acc: any, current: any) => {
      if (current._id) acc[current._id] = current.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      recentScans,
      cropDistribution: distributionMap
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Dashboard aggregation failed", error: error.message });
  }
};

// ====================================
// 2. COMMUNITY: CREATE POST WITH TAGS
// ====================================
// export const createCommunityPost = async (req: AuthRequest, res: Response) => {
//   try {
//     const { text, image } = req.body;

//     if (!text || text.trim() === "") {
//       return res.status(400).json({ success: false, message: "Post content cannot be empty" });
//     }

//     // Automatically capture hashtags like #fall-armyworm from the textbox input
//     const hashtagRegex = /#[\w-]+/g;
//     const matches = text.match(hashtagRegex) || [];
//     const cleanTags = matches.map((tag: string) => tag.replace("#", "").toLowerCase());

//     const post = await Post.create({
//       user: req.user.id,
//       text,
//       image, // Optional string value mapping back to your Cloudinary uploader logic
//       tags: cleanTags
//     });

//     return res.status(201).json({ success: true, post });
//   } catch (error: any) {
//     return res.status(500).json({ success: false, message: "Failed to publish post", error: error.message });
//   }
// };


// ====================================
// 2. COMMUNITY: CREATE POST WITH TAGS
// ====================================
export const createCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    const { text, image } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Post content cannot be empty" });
    }

    // Automatically capture hashtags like #fall-armyworm from the textbox input
    const hashtagRegex = /#[\w-]+/g;
    const matches = text.match(hashtagRegex) || [];
    const cleanTags = matches.map((tag: string) => tag.replace("#", "").toLowerCase());

    // 🌟 FIX: Change 'Scan.create' to 'Post.create' here
    const post = await Post.create({
      user: req.user.id,
      text,
      image, // Optional string value mapping back to your Cloudinary uploader logic
      tags: cleanTags
    });

    return res.status(201).json({ success: true, post });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to publish post", error: error.message });
  }
};

// ====================================
// 3. COMMUNITY: FETCH & SEARCH POSTS
// ====================================
export const getCommunityPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    let searchCriteria: any = {};

    // Handles searches for phrases, users, or distinct hashtags directly via the top search bars
    if (search) {
      const queryStr = String(search).trim();
      searchCriteria.$or = [
        { text: { $regex: queryStr, $options: "i" } },
        { tags: queryStr.toLowerCase() }
      ];
    }

    const posts = await Post.find(searchCriteria)
      .populate("user", "name profileImage") // Populates profile fields like Cindy Thompson's info
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to load community feed", error: error.message });
  }
};

// ====================================
// 4. KNOWLEDGE BASE: DISEASE DIRECTORY
// ====================================
export const getUserKnowledgeBase = async (req: Request, res: Response) => {
  try {
    // Generates a comprehensive dynamic crop dictionary out of existing Scan logs 
    const diseaseGuides = await Scan.aggregate([
      {
        $group: {
          _id: { crop: "$crop", prediction: "$prediction" },
          averageConfidence: { $avg: "$confidence" }
        }
      },
      {
        $project: {
          _id: 0,
          diseaseName: "$_id.prediction",
          cropType: "$_id.crop",
          perceivedSeverity: {
            // Evaluates severity index targets based on typical machine model margins
            $cond: { if: { $gte: ["$averageConfidence", 85] }, then: "High", else: "Medium" }
          }
        }
      },
      { $sort: { cropType: 1, diseaseName: 1 } }
    ]);

    return res.status(200).json({ success: true, data: diseaseGuides });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to assemble knowledge resources", error: error.message });
  }
};