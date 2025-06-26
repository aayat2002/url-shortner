// import express from "express";
// import { connectToMongoDB } from "./connect.js";
// import urlRoute from "./routes/url.js";
// import URL from "./models/url.js"; // Fixed: URl -> URL

// const app = express();
// const PORT = 8001;

// // Middleware
// app.use(express.json());

// // Debug middleware
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log("Body:", req.body);
//   next();
// });

// // Routes
// app.use("/url", urlRoute); // POST /url and GET /url/:shortId

// // Redirect route - Fixed syntax
// app.get("/:shortId", async (req, res) => {
//   try {
//     const shortId = req.params.shortId;
//     console.log("Looking for shortId:", shortId);

//     const entry = await URL.findOneAndUpdate(
//       { shortId }, // find condition
//       {
//         $push: {
//           visitHistory: {
//             timestamp: Date.now(),
//           },
//         },
//       },
//       { new: true } // return updated document
//     );

//     if (!entry) {
//       return res.status(404).json({ error: "URL not found" });
//     }

//     console.log("Redirecting to:", entry.redirectURL);
//     return res.redirect(entry.redirectURL); // Fixed: redirect -> redirectURL
//   } catch (err) {
//     console.error("❌ Redirect Error:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Test route
// app.get("/", (req, res) => {
//   res.json({ message: "URL Shortener API is running!" });
// });

// // Connect to database and start server
// connectToMongoDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server started at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect to MongoDB:", err);
//   });
// ++++++++++++++
// import express from "express";
// import { connectToMongoDB } from "./connect.js";
// import urlRoute from "./routes/url.js";
// import URL from "./models/url.js";

// const app = express();
// const PORT = 8001;

// // Middleware
// app.use(express.json());

// // Debug middleware
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   console.log("Body:", req.body);
//   next();
// });

// // Test route (put this BEFORE the /:shortId route)
// app.get("/", (req, res) => {
//   res.json({ message: "URL Shortener API is running!" });
// });

// // URL creation routes
// app.use("/url", urlRoute);

// // Redirect route - put this LAST
// app.get("/:shortId", async (req, res) => {
//   try {
//     const shortId = req.params.shortId;
//     console.log("🔍 Looking for shortId:", shortId);

//     const entry = await URL.findOneAndUpdate(
//       { shortId },
//       {
//         $push: {
//           visitHistory: {
//             timestamp: Date.now(),
//           },
//         },
//       },
//       { new: true }
//     );

//     if (!entry) {
//       console.log("❌ URL not found for shortId:", shortId);
//       return res.status(404).json({
//         error: "URL not found",
//         shortId: shortId,
//       });
//     }

//     console.log("✅ Found URL, redirecting to:", entry.redirectURL);
//     return res.redirect(entry.redirectURL);
//   } catch (err) {
//     console.error("❌ Redirect Error:", err);
//     return res.status(500).json({
//       error: "Internal Server Error",
//       message: err.message,
//     });
//   }
// });

// // Connect to database and start server
// connectToMongoDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server started at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect to MongoDB:", err);
//   });
// +++++++++++++++++++

import express from "express";
import { connectToMongoDB } from "./connect.js";
import urlRoute from "./routes/url.js";
import URL from "./models/url.js";

const app = express();
const PORT = 8001;

// Middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Body:", req.body);
  next();
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "URL Shortener API is running!" });
});

// Debug route to check database
app.get("/debug/all", async (req, res) => {
  try {
    console.log("🔍 Fetching all URLs from database...");
    const allUrls = await URL.find({});
    console.log("📊 Found", allUrls.length, "URLs");
    res.json({
      count: allUrls.length,
      urls: allUrls,
    });
  } catch (err) {
    console.error("❌ Debug route error:", err);
    res.status(500).json({
      error: "Database error",
      message: err.message,
    });
  }
});

// URL creation routes
app.use("/url", urlRoute);

// Redirect route
app.get("/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;
    console.log("🔍 Looking for shortId:", shortId);

    // First, just try to find the entry without updating
    const entry = await URL.findOne({ shortId });
    console.log("📋 Database query result:", entry);

    if (!entry) {
      console.log("❌ URL not found for shortId:", shortId);
      return res.status(404).json({
        error: "URL not found",
        shortId: shortId,
      });
    }

    console.log("✅ Found entry:", {
      shortId: entry.shortId,
      redirectURL: entry.redirectURL,
      visitHistoryCount: entry.visitHistory.length,
    });

    // Now try to update the visit history
    console.log("🔄 Updating visit history...");
    entry.visitHistory.push({ timestamp: new Date() });
    await entry.save();
    console.log("✅ Visit history updated");

    console.log("🔗 Redirecting to:", entry.redirectURL);
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("❌ DETAILED REDIRECT ERROR:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      name: err.name,
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR HANDLER:");
  console.error(err);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Connect to database and start server
connectToMongoDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server started at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });
