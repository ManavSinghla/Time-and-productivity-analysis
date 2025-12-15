import express from "express";
import { getTodayTotalTime } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/today", getTodayTotalTime);

export default router;
