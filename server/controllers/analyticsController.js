import mongoose from "mongoose";
import Task from "../models/task.js";

// TOTAL TIME TODAY
// @desc   Get total time spent today (USER-SPECIFIC)
// @route  GET /api/analytics/today
export const getTodayTotalTime = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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
    console.error("Error in getTodayTotalTime:", error);
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
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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
    console.error("Error in getTodayProductivity:", error);
    res.status(500).json({ message: error.message });
  }
};

// PRODUCTIVITY THIS WEEK
// @desc   Productivity score for this week (USER-SPECIFIC)
// @route  GET /api/analytics/productivity/week
export const getWeeklyProductivity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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
    console.error("Error in getWeeklyProductivity:", error);
    res.status(500).json({ message: error.message });
  }
};

// GAMIFICATION STATS
// @desc   Get user streaks and badges
// @route  GET /api/analytics/gamification
export const getGamificationStats = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user }).sort({ date: -1 });
    
    // Calculate total time
    const totalTimeLogged = tasks.reduce((sum, t) => sum + t.timeSpent, 0);

    // Calculate Streak
    let currentStreak = 0;
    const uniqueDates = [...new Set(tasks.map(t => new Date(t.date).toISOString().split('T')[0]))].sort().reverse();
    
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];
      
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedDateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates[i] === expectedDateStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Determine Badges
    const badges = [];
    if (tasks.length > 0) badges.push({ id: "first_task", name: "First Step", icon: "🌱", description: "Logged your first task!" });
    if (currentStreak >= 3) badges.push({ id: "streak_3", name: "On Fire", icon: "🔥", description: "Maintained a 3-day streak!" });
    if (currentStreak >= 7) badges.push({ id: "streak_7", name: "Consistency Master", icon: "🏆", description: "7-day streak achieved!" });
    if (totalTimeLogged >= 600) badges.push({ id: "time_10h", name: "Time Wizard", icon: "🧙‍♂️", description: "Logged over 10 hours of productivity." });
    
    res.json({
      currentStreak,
      totalTimeLogged,
      badges
    });
  } catch (error) {
    console.error("Error in getGamificationStats:", error);
    res.status(500).json({ message: error.message });
  }
};

// GOALS STATS
// @desc   Get specific target goals progress
// @route  GET /api/analytics/goals
export const getGoalsStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // 1. Study time today
    const studyTodayTasks = await Task.find({
      user: req.user,
      category: "Study",
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const studyToday = studyTodayTasks.reduce((sum, t) => sum + t.timeSpent, 0);

    // 2. Work time this week
    const workWeekTasks = await Task.find({
      user: req.user,
      category: "Work",
      date: { $gte: weekStart, $lte: todayEnd }
    });
    const workThisWeek = workWeekTasks.reduce((sum, t) => sum + t.timeSpent, 0);

    // 3. Other time today
    const otherTodayTasks = await Task.find({
      user: req.user,
      category: "Other",
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const otherToday = otherTodayTasks.reduce((sum, t) => sum + t.timeSpent, 0);

    // 4. Current streak (reuse logic from gamification)
    const allTasks = await Task.find({ user: req.user }).sort({ date: -1 });
    let currentStreak = 0;
    const uniqueDates = [...new Set(allTasks.map(t => new Date(t.date).toISOString().split('T')[0]))].sort().reverse();
    if (uniqueDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];
      
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedDateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates[i] === expectedDateStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      studyToday,
      workThisWeek,
      otherToday,
      currentStreak
    });

  } catch (error) {
    console.error("Error in getGoalsStats:", error);
    res.status(500).json({ message: error.message });
  }
};
