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
}

const ScanSchema = new Schema<IScan>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
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
    }
  },
  {
    timestamps: true
  }
);

const Scan = mongoose.model<IScan>(
  "Scan",
  ScanSchema
);

export default Scan;