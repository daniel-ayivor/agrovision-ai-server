import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../app";

dotenv.config();

const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => {
//     console.log("MongoDB connected");

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log(error);
//   });


  mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("🔥 SUCCESS: Connected to wamigro_ai_plant_disease_hub!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ DATABASE CRASH DETAILS:");
    console.error(error);
    process.exit(1); // Force Render to log the exact connection failure reason!
  });