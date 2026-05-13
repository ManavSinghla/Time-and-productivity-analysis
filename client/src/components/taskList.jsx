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
      Study: "category-study",
      Work: "category-work",
      Personal: "category-personal",
      Other: "category-other",
    };
    return classes[category] || classes.Other;
  };

  return (
    <div className="container">
      <AddTask onTaskAdded={handleTaskAdded} />

      <div className="task-list-container">
        <h2 className="section-title">📋 Your Tasks</h2>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Add your first task above!</p>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <div key={task._id} className="task-item">
                {editingId === task._id ? (
                  <div className="task-edit-form">
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
                    >
                      Save
                    </button>

                    <button
                      className="btn btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="task-content">
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className={`task-category ${getCategoryClass(task.category)}`}>
                          {task.category}
                        </span>
                        <span className="task-time">⏱️ {task.timeSpent} min</span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => startEdit(task)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(task._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
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
