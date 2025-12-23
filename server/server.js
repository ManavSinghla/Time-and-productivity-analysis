import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json("Server is running fine");
});


// Routes
import taskRoutes from "./routes/taskRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

// Connect to DB (serverless compatible)
if (!process.env.MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is undefined in environment variables.");
}
connectDB();

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;