import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./route/AuthRoute";
import adminAuthRoutes from "./route/AdminAuthRoute";
import scanRoutes from "./route/ScanRoute";
import weatherRoutes from "./route/WeatherRoute";
import imageUploadRoutes from "./route/ImageRoute";
import userDashboardRouter from "./route/UserRoute";
import adminRouter from "./route/AdminRoute";

const app = express();


// ====================================
// MIDDLEWARE
// ====================================

// app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://agrovision-ai-server.onrender.com",
    "https://localhost:3000", 
     "https://localhost:8080",
      "https://localhost:8081",

  ],
  credentials: true
}));
// app.use(express.json());

app.use(cookieParser());

// 🎯 INCREASE THIS: Allow larger payloads for high-res leaf scans
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// ====================================
// ROUTES
// ====================================

app.use("/api/auth", authRoutes);

app.use("/api/auth/admin", adminAuthRoutes);

app.use("/api/scans", scanRoutes);

app.use("/api/weather", weatherRoutes);
// Mount User Space Dashboard Operations Endpoints
app.use("/api/userspace", userDashboardRouter);
// Mount management routes safely
app.use("/api/admin", adminRouter);

app.use("/api/images", imageUploadRoutes);


// ====================================
// TEST ROUTE
// ====================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Agro AI API running"
  });
});





export default app;