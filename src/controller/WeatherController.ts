
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import Scan from "../model/Model";
import axios from "axios";

// Add this proxy helper inside your backend routes (e.g., inside a utility or weather route file)
// app.get("/api/weather/geocode",
     export const getGeocode = async (req: AuthRequest,
  res: Response) => {
  try {
    const { latitude, longitude } = req.query;
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&count=1`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed fetching data from geocoding API" });
  }
}