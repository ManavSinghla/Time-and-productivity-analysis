import express from "express";
import { getTodayTotalTime, getTimeByCategory } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/today", getTodayTotalTime);
router.get("/category", getTimeByCategory);

export default router;