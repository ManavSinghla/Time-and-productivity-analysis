import Task from "../models/task.js";

// @desc   Get total time spent today
// @route  GET /api/analytics/today
export const getTodayTotalTime = async (req, res) => {
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
};

// @desc   Get time spent per category
// @route  GET /api/analytics/category
export const getTimeByCategory = async (req, res) => {
    const result = await Task.aggregate([
{
            $group: {
                _id: "$category",
                totalTime: { $sum: "$timeSpent" }
            }
        }
    ]);
    res.json(result);
};

// @desc   Daily summary
// @route  GET /api/analytics/daily
export const getDailySummary = async (req, res) => {
    const summary = await Task.aggregate([
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" }
                },
                totalTime: { $sum: "$timeSpent" }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    res.json(summary);
};