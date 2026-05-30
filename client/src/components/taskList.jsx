import { useEffect, useState } from "react";
import { fetchTasks, deleteTask, updateTask } from "../services/taskService";
import AddTask from "./addTask";
import "../App.css";

function TaskList({ onTaskChange }) {
  const [tasks, setTasks] = useState([]);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
      loadTasks();
      if (onTaskChange) onTaskChange();
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditData({
      title: task.title,
      timeSpent: task.timeSpent,
      category: task.category,
    });
  };

  const handleUpdate = async (id) => {
    await updateTask(id, {
      title: editData.title,
      timeSpent: Number(editData.timeSpent),
      category: editData.category,
    });

    setEditingId(null);
    loadTasks();
    if (onTaskChange) onTaskChange();
  };

  const handleTaskAdded = () => {
    loadTasks();
    if (onTaskChange) onTaskChange();
  };

  const getCategoryClass = (category) => {
    const classes = {
      Study: "pill-study",
      Work: "pill-work",
      Personal: "pill-personal",
      Other: "pill-other",
    };
    return classes[category] || "pill-other";
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      <AddTask onTaskAdded={handleTaskAdded} />

      <div className="analytics-container">
        <h2 className="chart-title">Tasks List</h2>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Add your first task above!</p>
          </div>
        ) : (
          <div>
            <div className="task-table-header">
              <div>Name</div>
              <div>Category</div>
              <div>Date</div>
              <div>Time Spent</div>
              <div style={{ textAlign: "right", paddingRight: "0.5rem" }}>Actions</div>
            </div>
            
            {tasks.map((task) => (
              <div key={task._id} className="task-item">
                {editingId === task._id ? (
                  <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto", gap: "1rem" }}>
                    <input
                      type="text"
                      className="form-input"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      placeholder="Task title"
                    />

                    <input
                      type="number"
                      className="form-input"
                      value={editData.timeSpent}
                      onChange={(e) =>
                        setEditData({ ...editData, timeSpent: e.target.value })
                      }
                      placeholder="Minutes"
                    />

                    <select
                      className="form-select"
                      value={editData.category}
                      onChange={(e) =>
                        setEditData({ ...editData, category: e.target.value })
                      }
                    >
                      <option>Study</option>
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Other</option>
                    </select>

                    <button
                      className="btn btn-success"
                      onClick={() => handleUpdate(task._id)}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      Save
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingId(null)}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="task-title">{task.title}</div>
                    
                    <div>
                      <span className={`task-pill ${getCategoryClass(task.category)}`}>
                        {task.category}
                      </span>
                    </div>

                    <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                      {new Date(task.date || task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>

                    <div className="task-time">{task.timeSpent} min</div>

                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        className="btn-icon"
                        onClick={() => startEdit(task)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(task._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;
