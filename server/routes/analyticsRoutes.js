import express from "express";
import { getTodayTotalTime, getTimeByCategory, getDailySummary } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/today", getTodayTotalTime);
router.get("/category", getTimeByCategory);
router.get("/daily", getDailySummary);

export default router;