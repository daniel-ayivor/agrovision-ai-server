   
import express from "express";
import { getLocalizedAdvisory } from "../controller/WeatherController";
    const router = express.Router();

   router.get("/localized-advisory", getLocalizedAdvisory);


export default router;