import mongoose, { Schema, Document } from "mongoose";

export interface IUnrecognizedScan extends Document {
  imageUrl: string; // Base64 string or Cloudinary/S3 URL
  cropContext?: string; // Crop type if provided by the farmer
  confidenceScore: number;
  region: string;
  farmerId?: mongoose.Types.ObjectId;
  status: "Pending Review" | "Labeled & Added to Dataset" | "Discarded";
  correctLabel?: string; // To be filled by an admin/agronomist later during retraining
  createdAt: Date;
}

const UnrecognizedScanSchema: Schema = new Schema<IUnrecognizedScan>(
  {
    imageUrl: { type: String, required: true },
    cropContext: { type: String, trim: true },
    confidenceScore: { type: Number, required: true },
    region: { type: String, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ["Pending Review", "Labeled & Added to Dataset", "Discarded"],
      default: "Pending Review"
    },
    correctLabel: { type: String, trim: true }
  },
  { timestamps: true }
);

const UnrecognizedScan = mongoose.models.UnrecognizedScan || 
  mongoose.model<IUnrecognizedScan>("UnrecognizedScan", UnrecognizedScanSchema);

export default UnrecognizedScan;