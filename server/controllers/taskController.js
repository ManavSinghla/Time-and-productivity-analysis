import Task from "../models/task.js";

// @desc   Create a new task
// @route  POST /api/tasks
export const createTask = async (req, res) => {
    const { title, description, timeSpent, category, date } = req.body;
    if (!title || !timeSpent) {
        return res.status(400).json({ message: "Title and timeSpent are required" });
    }
    const task = await Task.create({
        user: req.user,
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
    const tasks = await Task.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(tasks);
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        return res.json({ message: "Task not found" });
    }
    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
};

// @desc   Update a task
// @route  PUT /api/tasks/:id
// @access Private
export const updateTask = async (req, res) => {
  try {
    const { title, description, timeSpent, category, date } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔐 Ownership check
    if (task.user.toString() !== req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.timeSpent = timeSpent ?? task.timeSpent;
    task.category = category || task.category;
    task.date = date || task.date;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
