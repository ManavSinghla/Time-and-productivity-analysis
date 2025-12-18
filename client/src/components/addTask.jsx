import { useState } from "react";
import { addTask } from "../services/taskService";
import "../App.css";

function AddTask({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [category, setCategory] = useState("Study");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !timeSpent) {
      alert("Title and time are required");
      return;
    }

    await addTask({
      title,
      timeSpent: Number(timeSpent),
      category,
    });

    setTitle("");
    setTimeSpent("");
    setCategory("Study");
    onTaskAdded();
  };

  return (
    <div className="task-form">
      <h2 className="task-form-title">➕ Add New Task</h2>
      
      <form onSubmit={handleSubmit} className="task-form-grid">
        <div>
          <label className="form-label" htmlFor="task-title">Task Title</label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="time-spent">Time (minutes)</label>
          <input
            id="time-spent"
            type="number"
            className="form-input"
            placeholder="Minutes"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            min="1"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Study</option>
            <option>Work</option>
            <option>Personal</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTask;
