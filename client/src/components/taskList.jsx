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
    priority: "Medium",
    recurrence: "none",
    subTasks: []
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
      priority: task.priority || "Medium",
      recurrence: task.recurrence?.type || "none",
      subTasks: task.subTasks || []
    });
  };

  const handleUpdate = async (id) => {
    await updateTask(id, {
      title: editData.title,
      timeSpent: Number(editData.timeSpent),
      category: editData.category,
      priority: editData.priority,
      recurrence: { type: editData.recurrence },
      subTasks: editData.subTasks
    });

    setEditingId(null);
    loadTasks();
    if (onTaskChange) onTaskChange();
  };

  const handleToggleSubtask = async (task, subtaskIndex) => {
    const updatedSubTasks = task.subTasks.map((st, idx) => 
      idx === subtaskIndex ? { ...st, completed: !st.completed } : st
    );
    await updateTask(task._id, { subTasks: updatedSubTasks });
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

  const getPriorityClass = (priority) => {
    const classes = {
      Low: "pill-priority-low",
      Medium: "pill-priority-medium",
      High: "pill-priority-high",
    };
    return classes[priority] || "pill-priority-medium";
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
              <div>Category / Priority</div>
              <div>Date</div>
              <div>Time Spent</div>
              <div style={{ textAlign: "right", paddingRight: "0.5rem" }}>Actions</div>
            </div>
            
            {tasks.map((task) => (
              <div key={task._id} className="task-item">
                {editingId === task._id ? (
                  <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr", gap: "1rem", background: "var(--hover-bg)", padding: "1.2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Task Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editData.title}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          placeholder="Task title"
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Time (min)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={editData.timeSpent}
                          onChange={(e) =>
                            setEditData({ ...editData, timeSpent: e.target.value })
                          }
                          placeholder="Minutes"
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Category</label>
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
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Priority</label>
                        <select
                          className="form-select"
                          value={editData.priority}
                          onChange={(e) =>
                            setEditData({ ...editData, priority: e.target.value })
                          }
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Recurrence</label>
                        <select
                          className="form-select"
                          value={editData.recurrence}
                          onChange={(e) =>
                            setEditData({ ...editData, recurrence: e.target.value })
                          }
                        >
                          <option value="none">None</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: "0.5rem" }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleUpdate(task._id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-title">
                      {task.title}
                      {task.recurrence && task.recurrence.type !== "none" && (
                        <span className="recurrence-badge" style={{ marginLeft: "0.5rem" }}>
                          🔁 {task.recurrence.type}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                      <span className={`task-pill ${getCategoryClass(task.category)}`}>
                        {task.category}
                      </span>
                      <span className={`task-pill ${getPriorityClass(task.priority)}`}>
                        {task.priority || "Medium"}
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

                    {/* Subtasks Checklist */}
                    {task.subTasks && task.subTasks.length > 0 && (
                      <div className="subtasks-container">
                        <div className="subtask-header">
                          <span>Checklist ({task.subTasks.filter(st => st.completed).length} / {task.subTasks.length})</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--accent-indigo)" }}>
                            {Math.round((task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100)}% Complete
                          </span>
                        </div>
                        <ul className="subtask-list">
                          {task.subTasks.map((st, idx) => (
                            <li 
                              key={idx} 
                              className={`subtask-item ${st.completed ? "completed" : ""}`}
                              onClick={() => handleToggleSubtask(task, idx)}
                            >
                              <input 
                                type="checkbox" 
                                checked={st.completed} 
                                onChange={() => {}} 
                              />
                              <span>{st.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
