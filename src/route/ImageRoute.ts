import { Router } from "express";
// import { uploadProfileImage } from "../controller/ImageUploadController";
import { protect } from "../middleware/Middleware";
import upload from "../config/ImageLoader";
import { UploadProfileImage } from "../controller/ImageUploadController";

const router = Router();

router.put(
  "/upload-profile",
  protect,
  upload.single("image"),
  UploadProfileImage
);



export default router;