// controllers/url.js
import { nanoid } from "nanoid";
import URL from "../models/url.js";

export async function handleGenerateNewShortURL(req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const shortId = nanoid(8);

  await URL.create({
    shortId,
    redirectURL: url,
    visitHistory: [],
  });

  res.json({ shortId });
}

export async function handleRedirect(req, res) {
  const { shortId } = req.params;
  const entry = await URL.findOne({ shortId });

  if (!entry) return res.status(404).send("URL not found");

  entry.visitHistory.push({ timestamp: Date.now() });
  await entry.save();

  res.redirect(entry.redirectURL);
}
