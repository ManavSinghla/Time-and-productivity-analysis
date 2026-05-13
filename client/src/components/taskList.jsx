import { useEffect, useState } from "react";
import { fetchTasks, deleteTask, updateTask } from "../services/taskService";
import AddTask from "./addTask";
import "../App.css";

function TaskList({ onTaskChange }) {
  const [tasks, setTasks] = useState([]);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    timeSpent: "",
    category: "Study",
    date: ""
  });

  const [expandedDescId, setExpandedDescId] = useState(null);

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
      description: task.description || "",
      timeSpent: task.timeSpent,
      category: task.category,
      date: task.date ? new Date(task.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (id) => {
    await updateTask(id, {
      title: editData.title,
      description: editData.description,
      timeSpent: Number(editData.timeSpent),
      category: editData.category,
      date: editData.date
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

  const filteredTasks = tasks.filter(task => {
    const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let dateMatch = true;
    if (dateFilter) {
      const taskDate = task.date ? new Date(task.date).toISOString().split('T')[0] : "";
      dateMatch = taskDate === dateFilter;
    }
    
    return searchMatch && dateMatch;
  });

  return (
    <div className="container">
      <AddTask onTaskAdded={handleTaskAdded} />

      <div className="task-list-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ margin: 0 }}>📋 Your Tasks</h2>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="🔍 Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.5rem 1rem", width: "200px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: "600" }}>Filter Date:</label>
              <input 
                type="date" 
                className="form-input" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "0.5rem 1rem" }}
              />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>✖</button>
              )}
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>{tasks.length === 0 ? "No tasks found. Add your first task above!" : "No tasks match your filters."}</p>
          </div>
        ) : (
          <div>
            {filteredTasks.map((task) => (
              <div key={task._id} className="task-item">
                {editingId === task._id ? (
                  <div className="task-edit-form" style={{ gridTemplateColumns: "1fr", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
                      <input
                        type="text"
                        className="form-input"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="Task title"
                      />
                      <input
                        type="number"
                        className="form-input"
                        value={editData.timeSpent}
                        onChange={(e) => setEditData({ ...editData, timeSpent: e.target.value })}
                        placeholder="Minutes"
                      />
                      <select
                        className="form-select"
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      >
                        <option>Study</option>
                        <option>Work</option>
                        <option>Personal</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                      <textarea
                        className="form-input"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Description (Optional)"
                        rows="2"
                        style={{ resize: "vertical" }}
                      />
                      <input
                        type="date"
                        className="form-input"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                      <button className="btn btn-success" onClick={() => handleUpdate(task._id)}>Save</button>
                      <button className="btn btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="task-content">
                    <div className="task-info" style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                          <div className="task-title" style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {task.title}
                            {task.description && (
                              <button 
                                onClick={() => setExpandedDescId(expandedDescId === task._id ? null : task._id)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "#6b7280" }}
                                title="Toggle Description"
                              >
                                {expandedDescId === task._id ? "🔼" : "🔽"}
                              </button>
                            )}
                          </div>
                          
                          {expandedDescId === task._id && task.description && (
                            <p style={{ color: "#4b5563", fontSize: "0.95rem", marginTop: "0.5rem", marginBottom: "0.5rem", background: "#f9fafb", padding: "0.75rem", borderRadius: "8px", borderLeft: "4px solid #667eea" }}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className="task-meta" style={{ marginTop: "0.5rem" }}>
                            <span className={`task-category ${getCategoryClass(task.category)}`}>
                              {task.category}
                            </span>
                            <span className="task-time">⏱️ {task.timeSpent} min</span>
                            <span style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              📅 {task.date ? new Date(task.date).toLocaleDateString() : new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="task-actions">
                          <button className="btn btn-edit" onClick={() => startEdit(task)}>✏️ Edit</button>
                          <button className="btn btn-delete" onClick={() => handleDelete(task._id)}>🗑️ Delete</button>
                        </div>
                      </div>
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
