

// model/visitModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFarmVisit extends Document {
  officer: mongoose.Types.ObjectId;   // The Agricultural Officer
  farmer: mongoose.Types.ObjectId;    // The Farmer being visited
  scheduledDate: Date;               // When the visit is planned / took place
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "reschedule_requested";
  visitNotes?: string;               // Records/observations made during the visit
  recommendations?: string;          // Advice given to the farmer
  nextVisitDate?: Date;              // Scheduled follow-up date
  images?: string[];                 // Optional photos taken during the visit
  farmerFeedback?: string;           
}

const FarmVisitSchema = new Schema<IFarmVisit>(
  {
    officer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    farmer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled", "reschedule_requested"],
      default: "scheduled",
    },
    visitNotes: { type: String },
    recommendations: { type: String },
    nextVisitDate: { type: Date },
    images: [{ type: String }],
    farmerFeedback: { type: String },
  },
  { timestamps: true }
);

const FarmVisit = mongoose.model<IFarmVisit>("FarmVisit", FarmVisitSchema);
export default FarmVisit;