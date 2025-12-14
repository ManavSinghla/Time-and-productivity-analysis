import Task from "../models/task.js";

// @desc   Create a new task
// @route  POST /api/tasks
export const createTask = async (req, res) => {
    try {
        const { title, description, timeSpent, category, date } = req.body;

        if (!title || !timeSpent) {
            return res.status(400).json({ message: "Title and timeSpent are required" });
        }

        const task = await Task.create({
            title,
            description,
            timeSpent,
            category,
            date
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all tasks
// @route  GET /api/tasks
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
