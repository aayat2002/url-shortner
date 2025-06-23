// models/url.js
import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  redirectURL: {
    type: String,
    required: true,
  },
  visitHistory: [{ timestamp: { type: Date, default: Date.now } }],
});

const URL = mongoose.model("URL", urlSchema);
export default URL;
