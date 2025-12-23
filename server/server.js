import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json("Server is running fine");
});

connectDB();
const PORT = process.env.PORT || 5000;

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

import taskRoutes from "./routes/taskRoutes.js";
app.use("/api/tasks", taskRoutes);

import analyticsRoutes from "./routes/analyticsRoutes.js";
app.use("/api/analytics", analyticsRoutes);

import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);