import express from "express";
import { getTodayTotalTime, getTimeByCategory, getDailySummary, getWeeklySummary, getProductivityScore, getTodayProductivity, getWeeklyProductivity, getGamificationStats, getGoalsStats } from "../controllers/analyticsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/today", protect, getTodayTotalTime);
router.get("/category", protect, getTimeByCategory);
router.get("/daily", protect, getDailySummary);
router.get("/weekly", protect, getWeeklySummary);
router.get("/productivity", protect, getProductivityScore);
router.get("/productivity/today", protect, getTodayProductivity);
router.get("/productivity/week", protect, getWeeklyProductivity);
router.get("/gamification", protect, getGamificationStats);
router.get("/goals", protect, getGoalsStats);

export default router;