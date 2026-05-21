import { Response } from "express";
import cloudinary from "../config/Cloudinary";
import { AuthRequest } from "../middleware/Middleware";
import User from "../model/Auth";

export const UploadProfileImage = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    public_id: `${req.user.id}_profile`,
    width: 500,
    height: 500,
    crop: "fill",
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profileImage: result.secure_url,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    user,
  });
};