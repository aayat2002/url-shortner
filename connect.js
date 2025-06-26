import mongoose from "mongoose";

export async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/short-url");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
