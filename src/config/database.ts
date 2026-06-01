import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../app";

dotenv.config();

const PORT = process.env.PORT || 5000;


export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("CRITICAL: MONGO_URI environment variable is missing!");
    }

    console.log("⏳ Initializing connection handshake with MongoDB Atlas...");
    
    await mongoose.connect(mongoUri);
    
    console.log("🔥 SUCCESS: Connected to wamigro_ai_plant_disease_hub cluster!");
  } catch (error) {
    console.error("❌ DATABASE CONNECTION FAILURE:");
    console.error(error);
    process.exit(1); // Force Render to crash and show us the exact issue if it fails
  }
};