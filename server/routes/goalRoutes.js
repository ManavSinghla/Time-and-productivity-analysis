import express from "express";
import { getGoalsWithProgress, createGoal, deleteGoal } from "../controllers/goalController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, getGoalsWithProgress)
    .post(protect, createGoal);

router.route("/:id")
    .delete(protect, deleteGoal);

export default router;
