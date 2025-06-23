// connect.js
import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/urlshortner");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};
