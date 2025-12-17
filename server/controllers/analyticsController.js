import mongoose from "mongoose";
import Task from "../models/task.js";

// TOTAL TIME TODAY
// @desc   Get total time spent today (USER-SPECIFIC)
// @route  GET /api/analytics/today
export const getTodayTotalTime = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user,
      date: { $gte: startOfDay, $lte: endOfDay },
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

// TIME BY CATEGORY
// @desc   Get time spent per category (USER-SPECIFIC)
// @route  GET /api/analytics/category
export const getTimeByCategory = async (req, res) => {
  try {
    const result = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
        },
      },
      {
        $group: {
          _id: "$category",
          totalTime: { $sum: "$timeSpent" },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DAILY SUMMARY
// @desc   Daily summary (USER-SPECIFIC)
// @route  GET /api/analytics/daily
export const getDailySummary = async (req, res) => {
  try {
    const summary = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          totalTime: { $sum: "$timeSpent" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WEEKLY SUMMARY
export const getWeeklySummary = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);
    lastWeek.setHours(0, 0, 0, 0);

    const weeklyData = await Task.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
          date: { $gte: lastWeek, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          totalTime: { $sum: "$timeSpent" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PRODUCTIVITY SCORE (ALL TIME)
// @desc   Productivity score (USER-SPECIFIC)
// @route  GET /api/analytics/productivity
export const getProductivityScore = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user });

    let totalTime = 0;
    let productiveTime = 0;

    tasks.forEach((task) => {
      totalTime += task.timeSpent;
      if (task.category === "Study" || task.category === "Work") {
        productiveTime += task.timeSpent;
      }
    });

    const productivityScore =
      totalTime === 0
        ? 0
        : Math.round((productiveTime / totalTime) * 100);

    res.json({
      totalTime,
      productiveTime,
      productivityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PRODUCTIVITY TODAY
// @desc   Productivity score for today (USER-SPECIFIC)
// @route  GET /api/analytics/productivity/today
export const getTodayProductivity = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user,
      date: { $gte: start, $lte: end },
    });

    let totalTime = 0;
    let productiveTime = 0;

    tasks.forEach((task) => {
      totalTime += task.timeSpent;
      if (task.category === "Study" || task.category === "Work") {
        productiveTime += task.timeSpent;
      }
    });

    const productivityScore =
      totalTime === 0
        ? 0
        : Math.round((productiveTime / totalTime) * 100);

    res.json({ totalTime, productiveTime, productivityScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PRODUCTIVITY THIS WEEK
// @desc   Productivity score for this week (USER-SPECIFIC)
// @route  GET /api/analytics/productivity/week
export const getWeeklyProductivity = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user,
      date: { $gte: start, $lte: today },
    });

    let totalTime = 0;
    let productiveTime = 0;

    tasks.forEach((task) => {
      totalTime += task.timeSpent;
      if (task.category === "Study" || task.category === "Work") {
        productiveTime += task.timeSpent;
      }
    });

    const productivityScore =
      totalTime === 0
        ? 0
        : Math.round((productiveTime / totalTime) * 100);

    res.json({ totalTime, productiveTime, productivityScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
