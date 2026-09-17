import { Response } from "express";
import { AuthRequest } from "../middleware/Middleware";
import CropSeason from "../model/cropSeasonModel";
import User from "../model/Auth";

export const getLocalizedAdvisory = async (req: AuthRequest, res: Response) => {
  try {
    // 🎯 Priority 1: Check if region was passed directly as a query parameter from frontend storage
    let userRegion = (req.query.region as string) || req.user?.region;

    // 🛡️ Fallback 2: Check token or fetch fresh from MongoDB if query param is missing
    if (!userRegion && (req.user?.id || req.user?._id)) {
      const dbUser = await User.findById(req.user.id || req.user._id);
      if (dbUser) {
        userRegion = dbUser.region;
      }
    }

    if (!userRegion) {
      return res.status(400).json({
        success: false,
        message: "Region not specified in user profile. Please update your profile region.",
      });
    }

    // 1. Fetch optimal planting/harvesting rules from MongoDB
    const regionalGuides = await CropSeason.find({
      region: { $regex: new RegExp(userRegion, "i") },
    });

    // 2. Fetch coordinates using Open-Meteo Geocoding
    let weatherInfo = null;
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(userRegion)}&count=1&language=en`
      );
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude } = geoData.results[0];

        // 3. Fetch real-time weather from Open-Meteo
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
        );
        const weatherData = await weatherRes.json();

        weatherInfo = {
          temperature: weatherData.current?.temperature_2m,
          humidity: weatherData.current?.relative_humidity_2m,
          windSpeed: weatherData.current?.wind_speed_10m,
        };
      }
    } catch (weatherErr) {
      console.warn("Could not fetch live weather data from Open-Meteo, relying on seasonal guidelines.");
    }

    const currentMonthName = new Date().toLocaleString("default", { month: "long" });

    let actionableAdvice = `Current weather conditions in ${userRegion} are stable for general farming activities.`;
    if (weatherInfo && weatherInfo.humidity > 85) {
      actionableAdvice = `High humidity detected in ${userRegion} (${weatherInfo.humidity}%). Watch out for fungal infections and crop diseases; consider scheduling an agricultural officer visit.`;
    }

    return res.status(200).json({
      success: true,
      region: userRegion,
      currentMonth: currentMonthName,
      weather: weatherInfo,
      cropRecommendations: regionalGuides,
      advisoryPrompt: actionableAdvice,
    });

  } catch (error: any) {
    console.error("Localized Advisory Error:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};