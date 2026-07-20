import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import route from "./src/Routes/Route.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.URI)
  .then(() => console.log("Database Connection Successful"))
  .catch((err) => console.error("MongoDB Connection Error", err));

// Test Route
app.get("/", (req, res) => {
  res.send("✅ TrekFast backend is running!");
});

// Routes
app.use(route);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

export default app;