   
import express from "express";
import { getGeocode } from "../controller/WeatherController";
    const router = express.Router();


   router.get("/geocode", getGeocode);


export default router;