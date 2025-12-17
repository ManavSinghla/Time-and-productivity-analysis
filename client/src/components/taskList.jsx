import { useEffect, useState } from "react";
import { fetchTasks, deleteTask, updateTask } from "../services/taskService";
import AddTask from "./addTask";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  // 🔹 Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    timeSpent: "",
    category: "Study",
  });

  const loadTasks = () => {
    fetchTasks().then((data) => setTasks(data));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // 🔹 Delete task
  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  // 🔹 Start editing
  const startEdit = (task) => {
    setEditingId(task._id);
    setEditData({
      title: task.title,
      timeSpent: task.timeSpent,
      category: task.category,
    });
  };

  // 🔹 Save updated task
  const handleUpdate = async (id) => {
    await updateTask(id, {
      title: editData.title,
      timeSpent: Number(editData.timeSpent),
      category: editData.category,
    });

    setEditingId(null);
    loadTasks();
  };

  return (
    <div>
      <AddTask onTaskAdded={loadTasks} />

      <h2>Tasks</h2>

      {tasks.length === 0 && <p>No tasks found</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id} style={{ marginBottom: "10px" }}>
            {editingId === task._id ? (
              <>
                {/* Edit mode */}
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />

                <input
                  type="number"
                  value={editData.timeSpent}
                  onChange={(e) =>
                    setEditData({ ...editData, timeSpent: e.target.value })
                  }
                  style={{ marginLeft: "5px" }}
                />

                <select
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                  style={{ marginLeft: "5px" }}
                >
                  <option>Study</option>
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Other</option>
                </select>

                <button
                  onClick={() => handleUpdate(task._id)}
                  style={{ marginLeft: "5px" }}
                >
                  Save
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  style={{ marginLeft: "5px" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* View mode */}
                <strong>{task.title}</strong> – {task.timeSpent} min (
                {task.category})
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => startEdit(task)}
                >
                  Edit
                </button>
                <button
                  style={{ marginLeft: "5px" }}
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
