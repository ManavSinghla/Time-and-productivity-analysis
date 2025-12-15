import Task from "../models/task.js";

// @desc   Create a new task
// @route  POST /api/tasks
export const createTask = async (req, res) => {
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
};

// @desc   Get all tasks
// @route  GET /api/tasks
export const getTasks = async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.json({ message: "Task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
};