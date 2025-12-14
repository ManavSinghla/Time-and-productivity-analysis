import { useState } from "react";
import { addTask } from "../services/taskService";

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

    const newTask = {
      title,
      timeSpent: Number(timeSpent),
      category,
    };

    await addTask(newTask);

    setTitle("");
    setTimeSpent("");
    setCategory("Study");

    onTaskAdded(); // refresh list
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Task</h2>

      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Time spent (minutes)"
        value={timeSpent}
        onChange={(e) => setTimeSpent(e.target.value)}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Study</option>
        <option>Work</option>
        <option>Personal</option>
        <option>Other</option>
      </select>

      <button type="submit">Add Task</button>
    </form>
  );
}

export default AddTask;
