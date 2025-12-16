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

// @desc   Weekly productivity summary (last 7 days)
// @route  GET /api/analytics/weekly
export const getWeeklySummary = async (req, res) => {
    try {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 6);
        lastWeek.setHours(0, 0, 0, 0);

        const weeklyData = await Task.aggregate([
            {
                $match: {
                    date: { $gte: lastWeek, $lte: today }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    },
                    totalTime: { $sum: "$timeSpent" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(weeklyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Productivity score (percentage)
// @route  GET /api/analytics/productivity
export const getProductivityScore = async (req, res) => {
    const tasks = await Task.find();
    let totalTime = 0;
    let productiveTime = 0;
    tasks.forEach(task => {
        totalTime += task.timeSpent;
        if (task.category === "Study" || task.category === "Work") {
            productiveTime += task.timeSpent;
        }
    });
    const productivityScore = totalTime === 0 ? 0 : Math.round((productiveTime / totalTime) * 100);
    res.json({
        totalTime,
        productiveTime,
        productivityScore
    });
};
