import express from "express";
import { getTodayTotalTime, getTimeByCategory, getDailySummary, getWeeklySummary, getProductivityScore, getTodayProductivity, getWeeklyProductivity } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/today", getTodayTotalTime);
router.get("/category", getTimeByCategory);
router.get("/daily", getDailySummary);
router.get("/weekly", getWeeklySummary);
router.get("/productivity", getProductivityScore);
router.get("/productivity/today", getTodayProductivity);
router.get("/productivity/week", getWeeklyProductivity);

export default router;