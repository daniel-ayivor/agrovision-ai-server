import mongoose, { Schema, Document } from "mongoose";

export interface ICropSeason extends Document {
  cropName: string;                 // e.g., Maize, Cassava, Tomato
  region: string;                   // e.g., Ashanti Region, Northern Region
  plantingSeasonStart: string;      // e.g., "March" or month index
  plantingSeasonEnd: string;        // e.g., "April"
  harvestSeasonStart: string;       // e.g., "July"
  harvestSeasonEnd: string;         // e.g., "August"
  weatherAdvisory: string;          // e.g., "Requires moderate rainfall. Watch out for dry spells in June."
}


const CropSeasonSchema = new Schema<ICropSeason>(
  {
    cropName: { type: String, required: true },
    region: { type: String, required: true },
    plantingSeasonStart: { type: String, required: true },
    plantingSeasonEnd: { type: String, required: true },
    harvestSeasonStart: { type: String, required: true },
    harvestSeasonEnd: { type: String, required: true },
    weatherAdvisory: { type: String },
  },
  { timestamps: true }
);

const CropSeason = mongoose.model<ICropSeason>("CropSeason", CropSeasonSchema);
export default CropSeason;