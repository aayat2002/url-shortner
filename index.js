// index.js
import express from "express";
import { connectToMongoDB } from "./connect.js";
import urlRoute from "./routes/url.js";

const app = express();
const PORT = 8001;

app.use(express.json());
app.use("/url", urlRoute); // POST /url and GET /url/:shortId

connectToMongoDB();

app.listen(PORT, () => {
  console.log(` Server started at http://localhost:${PORT}`);
});
