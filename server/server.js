import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running fine");
});

connectDB();

// Get also working fine 
app.use("/api/tasks", taskRoutes);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
