import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./route/AuthRoute";
import adminAuthRoutes from "./route/AdminAuthRoute";
import scanRoutes from "./route/ScanRoute";
import imageUploadRoutes from "./route/ImageRoute";

const app = express();


// ====================================
// MIDDLEWARE
// ====================================

app.use(cors());

app.use(express.json());

app.use(cookieParser());


// ====================================
// ROUTES
// ====================================

app.use("/api/auth", authRoutes);

app.use("/api/auth/admin", adminAuthRoutes);

app.use("/api/scans", scanRoutes);

app.use("/api/upload", imageUploadRoutes);


// ====================================
// TEST ROUTE
// ====================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Agro AI API running"
  });
});


// ====================================
// SERVER
// ====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});


export default app;