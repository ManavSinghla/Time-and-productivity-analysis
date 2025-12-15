import express from "express";
import { getTodayTotalTime, getTimeByCategory, getDailySummary, getWeeklySummary } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/today", getTodayTotalTime);
router.get("/category", getTimeByCategory);
router.get("/daily", getDailySummary);
router.get("/weekly", getWeeklySummary);

export default router;