import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running fine");
});

connectDB();

app.use("/api/tasks", taskRoutes);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

