import mongoose from "mongoose";
import dotenv from "dotenv";
import CropSeason from "./model/cropSeasonModel"; // Adjust path to your CropSeason model

dotenv.config();

const ghanaSeasonalData = [
  // --- GREATER ACCRA & COASTAL SAVANNA ZONE ---
  {
    cropName: "Maize (Major Season)",
    region: "Greater Accra",
    plantingSeasonStart: "March",
    plantingSeasonEnd: "April",
    harvestSeasonStart: "July",
    harvestSeasonEnd: "August",
    weatherAdvisory: "Take advantage of the early bimodal rains. Ensure proper field drainage to prevent waterlogging during heavy downpours."
  },
  {
    cropName: "Cassava",
    sregion: "Greater Accra",
    region: "Greater Accra",
    plantingSeasonStart: "April",
    plantingSeasonEnd: "June",
    harvestSeasonStart: "February",
    harvestSeasonEnd: "April",
    weatherAdvisory: "Highly drought-tolerant. Monitor closely for cassava mosaic disease if humidity levels rise past 85%."
  },
  {
    cropName: "Garden Eggs (Eggplant)",
    region: "Greater Accra",
    plantingSeasonStart: "September",
    plantingSeasonEnd: "October",
    harvestSeasonStart: "December",
    harvestSeasonEnd: "January",
    weatherAdvisory: "Ideal for the minor dry-to-cool harmattan transition. Utilize light irrigation to maximize fruit yield."
  },

  // --- ASHANTI & FOREST BELT ZONE ---
  {
    cropName: "Plantain",
    region: "Ashanti",
    plantingSeasonStart: "March",
    plantingSeasonEnd: "May",
    harvestSeasonStart: "December",
    harvestSeasonEnd: "February",
    weatherAdvisory: "Apply heavy organic mulch around root zones to retain moisture during unexpected dry spells in the forest belt."
  },
  {
    cropName: "Tomato",
    region: "Ashanti",
    plantingSeasonStart: "August",
    plantingSeasonEnd: "September",
    harvestSeasonStart: "November",
    harvestSeasonEnd: "December",
    weatherAdvisory: "Kumasi morning mists increase fungal spore risks; apply preventive bio-fungicides and avoid overhead watering."
  },
  {
    cropName: "Cocoa",
    region: "Ashanti",
    plantingSeasonStart: "May",
    plantingSeasonEnd: "June",
    harvestSeasonStart: "October",
    harvestSeasonEnd: "March",
    weatherAdvisory: "Main crop harvesting window is open. Ensure proper pod sorting and fermentation under dry shaded covers."
  },

  // --- VOLTA & RIVER BASIN ZONE ---
  {
    cropName: "Lowland Rice",
    region: "Volta",
    plantingSeasonStart: "June",
    plantingSeasonEnd: "July",
    harvestSeasonStart: "November",
    harvestSeasonEnd: "December",
    weatherAdvisory: "Align planting with the peak Volta river basin water levels. Monitor bund integrity and control weed competition early."
  },
  {
    cropName: "Okra",
    region: "Volta",
    plantingSeasonStart: "April",
    plantingSeasonEnd: "May",
    harvestSeasonStart: "July",
    harvestSeasonEnd: "August",
    weatherAdvisory: "Fast-maturing crop. Harvest every 2-3 days during peak sunshine hours to prevent pods from becoming woody."
  },

  // --- NORTHERN SAVANNA ZONE (Tamale / Northern regions) ---
  {
    cropName: "Sorghum / Millet",
    region: "Northern",
    plantingSeasonStart: "June",
    plantingSeasonEnd: "July",
    harvestSeasonStart: "October",
    harvestSeasonEnd: "November",
    weatherAdvisory: "Perfect fit for the unimodal northern rainfall regime. Highly resilient against short dry spells."
  },
  {
    cropName: "Groundnuts (Peanuts)",
    region: "Northern",
    plantingSeasonStart: "May",
    plantingSeasonEnd: "June",
    harvestSeasonStart: "September",
    harvestSeasonEnd: "October",
    weatherAdvisory: "Ensure pods are harvested before late season rains cause germination in the ground. Dry thoroughly post-harvest."
  },
  // --- CENTRAL & WESTERN ZONE (Forest & Coastal) ---
  {
    cropName: "Cassava (Bankye)",
    region: "Central",
    plantingSeasonStart: "March",
    plantingSeasonEnd: "May",
    harvestSeasonStart: "February",
    harvestSeasonEnd: "April",
    weatherAdvisory: "Well-suited for the bi-modal rainfall regime in the coastal forest belt. Ensure proper weed management during early root bulking stages."
  },
  {
    cropName: "Rubber",
    region: "Western",
    plantingSeasonStart: "May",
    plantingSeasonEnd: "June",
    harvestSeasonStart: "January",
    harvestSeasonEnd: "December",
    weatherAdvisory: "Tap during cooler morning hours. Heavy and continuous rains can interrupt latex collection schedules."
  },

  // --- EASTERN & BRONG-AHAFO (Transition Zones) ---
  {
    cropName: "Yam (Puna / Sett)",
    region: "Eastern",
    plantingSeasonStart: "January",
    plantingSeasonEnd: "March",
    harvestSeasonStart: "August",
    harvestSeasonEnd: "November",
    weatherAdvisory: "Plant early before the first rains to allow proper tuber setting. Stake vines securely to prevent wind damage."
  },
  {
    cropName: "Maize (Minor Season)",
    region: "Eastern",
    plantingSeasonStart: "August",
    plantingSeasonEnd: "September",
    harvestSeasonStart: "November",
    harvestSeasonEnd: "December",
    weatherAdvisory: "Monitor soil moisture closely during the short minor season; supplementary micro-irrigation can significantly boost grain fill."
  },
  {
    cropName: "Cashew",
    region: "Bono",
    plantingSeasonStart: "June",
    plantingSeasonEnd: "July",
    harvestSeasonStart: "February",
    harvestSeasonEnd: "May",
    weatherAdvisory: "Requires dry conditions during the flowering and nut-setting phases. Avoid waterlogged fields."
  },

  // --- UPPER EAST & UPPER WEST (Sudan Savanna) ---
  {
    cropName: "Millet",
    region: "Upper East",
    plantingSeasonStart: "May",
    plantingSeasonEnd: "June",
    harvestSeasonStart: "September",
    harvestSeasonEnd: "October",
    weatherAdvisory: "Extremely drought-resistant. Ideal for the short unimodal rainy season of the northern border zones."
  },
  {
    cropName: "Sorghum",
    region: "Upper West",
    plantingSeasonStart: "June",
    plantingSeasonEnd: "July",
    harvestSeasonStart: "October",
    harvestSeasonEnd: "November",
    weatherAdvisory: "Resilient against erratic rainfall patterns. Keep fields weed-free during the first 4 weeks of vegetative growth."
  },
  {
    cropName: "Cowpeas (Beans)",
    region: "Upper West",
    plantingSeasonStart: "July",
    plantingSeasonEnd: "August",
    harvestSeasonStart: "October",
    harvestSeasonEnd: "November",
    weatherAdvisory: "Short-duration legume that improves soil nitrogen. Scout regularly for pod borers and apply targeted organic sprays if necessary."
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "your_mongodb_connection_string_here";
    await mongoose.connect(mongoUri);
    console.log("📦 Connected to MongoDB for seeding...");

    // Optional: Clear existing crop guidelines to prevent duplicate clutter
    await CropSeason.deleteMany({});
    console.log("🧹 Cleared old seasonal records.");

    // Insert new data
    await CropSeason.insertMany(ghanaSeasonalData);
    console.log("🌱 Successfully seeded Ghana regional crop seasons!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();