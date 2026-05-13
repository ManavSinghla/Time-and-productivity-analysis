import Goal from "../models/goal.js";
import Task from "../models/task.js";
import mongoose from "mongoose";

// @desc    Get user goals with calculated progress
// @route   GET /api/goals
export const getGoalsWithProgress = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user });
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
            const start = goal.timeframe === "weekly" ? weekStart : todayStart;
            
            const query = { 
                user: req.user, 
                date: { $gte: start, $lte: todayEnd } 
            };
            
            if (goal.category !== "All") {
                query.category = goal.category;
            }

            const tasks = await Task.find(query);
            const currentProgress = tasks.reduce((sum, t) => sum + t.timeSpent, 0);

            return { ...goal.toObject(), currentProgress };
        }));

        res.json(goalsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
export const createGoal = async (req, res) => {
    try {
        const { title, category, targetTime, timeframe, type } = req.body;
        
        const goal = new Goal({
            user: req.user,
            title,
            category,
            targetTime: Number(targetTime),
            timeframe,
            type: type || "min"
        });

        const createdGoal = await goal.save();
        res.status(201).json(createdGoal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" });
        }
        
        if (goal.user.toString() !== req.user.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await goal.deleteOne();
        res.json({ message: "Goal removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
