import Task from "../models/task.js";

// @desc   Get total time spent today
// @route  GET /api/analytics/today
export const getTodayTotalTime = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const tasks = await Task.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalTime = tasks.reduce(
            (sum, task) => sum + task.timeSpent,
            0
        );

        res.json({ totalTime });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
