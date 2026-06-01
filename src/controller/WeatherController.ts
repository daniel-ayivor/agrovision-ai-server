import { Response } from "express";
import { AuthRequest } from "../middleware/Middleware";

export const getGeocode = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, name } = req.query;

    // 📍 1. FIX: Reverse Geocoding (Coordinates -> Text Location Name)
    if (latitude && longitude) {
      // CRITICAL: Ensure this points to geocoding-api.open-meteo.com/v1/reverse
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&count=1`
      );
      
      const data = await response.json();
      return res.json(data);
    }

    // 🔍 2. Forward Geocoding (Text Name -> Coordinates)
    if (name) {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(String(name))}&count=1&language=en`
      );
      
      const data = await response.json();
      return res.json(data);
    }

    return res.status(400).json({ error: "Missing query parameters" });

  } catch (error) {
    console.error("Backend Proxy Error:", error);
    return res.status(500).json({ error: "Failed fetching data from geocoding API" });
  }
};