
import mongoose, {
  Schema,
  Document
} from "mongoose";

export interface IScan extends Document {
  user: mongoose.Types.ObjectId;
  image: string;
  crop: string;
  prediction: string;
  confidence: number;
  details: string; // Added field for Gemini insights
}

const ScanSchema = new Schema<IScan>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    image: {
      type: String,
      required: true
    },
    crop: {
      type: String,
      required: true
    },
    prediction: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    details: {
      type: String,
      required: false // Optional in case Gemini ever fails or times out
    }
  },
  {
    timestamps: true
  }
);

const Scan = mongoose.models.Scan || mongoose.model<IScan>("Scan", ScanSchema);

export default Scan;