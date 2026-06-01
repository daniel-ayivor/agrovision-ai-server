import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function bootstrap() {
  try {
    if (!MONGO_URI) {
      throw new Error("CRITICAL: MONGO_URI environment variable is missing!");
    }

    console.log("⏳ Initializing connection handshake with MongoDB Atlas...");
    
    // 1. Block everything until the MongoDB connection is 100% active
    await mongoose.connect(MONGO_URI);
    console.log("🔥 SUCCESS: Connected to wamigro_ai_plant_disease_hub cluster!");

    // 2. Dynamically import your app/routes ONLY AFTER the database is ready
    const app = (await import("./app")).default;

    // 3. Start listening for your client requests
    app.listen(PORT, () => {
      console.log(`🚀 Server running smoothly on port ${PORT}`);
    });

  } catch (error: any) {
    console.error("❌ CRITICAL SERVER BOOTSTRAP FAILURE:");
    console.error(error.message || error);
    process.exit(1); // Crash instantly so Render shows you the explicit error
  }
}

bootstrap();