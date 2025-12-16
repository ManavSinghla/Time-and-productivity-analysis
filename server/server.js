import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running fine");
});

connectDB();

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

import taskRoutes from "./routes/taskRoutes.js";
app.use("/api/tasks", taskRoutes);

import analyticsRoutes from "./routes/analyticsRoutes.js";
app.use("/api/analytics", analyticsRoutes);

import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);