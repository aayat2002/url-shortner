import { nanoid } from "nanoid";
import URL from "../models/url.js";

export async function handleGenerateNewShortURL(req, res) {
  try {
    console.log("=== Request received ===");
    console.log("Body:", req.body);

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log("Processing URL:", url);

    const shortId = nanoid(8);
    console.log("Generated shortId:", shortId);

    const newURL = await URL.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
    });

    console.log("✅ URL saved successfully");

    return res.status(201).json({
      shortId: shortId,
      originalUrl: url,
      shortUrl: `http://localhost:8001/${shortId}`,
    });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}

export async function handleGetAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;
    console.log("Getting analytics for:", shortId);

    const entry = await URL.findOne({ shortId });

    if (!entry) {
      return res.status(404).json({
        error: "URL not found",
        shortId: shortId,
      });
    }

    return res.json({
      shortId: entry.shortId,
      originalUrl: entry.redirectURL,
      totalClicks: entry.visitHistory.length,
      analytics: entry.visitHistory,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (err) {
    console.log("Analytics Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}

export async function handleRedirect(req, res) {
  try {
    const shortId = req.params.shortId;
    console.log("Looking for shortId:", shortId);

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "URL not found" });
    }

    console.log("Redirecting to:", entry.redirectURL);
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("❌ Redirect Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
