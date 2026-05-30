import { useEffect, useState } from "react";
import { fetchGoals, createGoal, deleteGoal } from "../services/goalService";

function GoalManager({ refreshTrigger }) {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("All");
    const [targetTime, setTargetTime] = useState("");
    const [timeframe, setTimeframe] = useState("daily");
    const [type, setType] = useState("min");

    const loadGoals = async () => {
        try {
            const data = await fetchGoals();
            setGoals(data);
        } catch (error) {
            console.error("Error loading goals:", error);
        }
    };

    useEffect(() => {
        loadGoals();
    }, [refreshTrigger]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!title || !targetTime) {
            alert("Please fill all required fields");
            return;
        }

        try {
            await createGoal({
                title,
                category,
                targetTime: Number(targetTime),
                timeframe,
                type
            });
            
            setTitle("");
            setTargetTime("");
            setCategory("All");
            setTimeframe("daily");
            setType("min");
            setShowForm(false);
            
            loadGoals();
        } catch (error) {
            console.error("Error creating goal:", error);
            alert("Failed to create goal");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            try {
                await deleteGoal(id);
                loadGoals();
            } catch (error) {
                console.error("Error deleting goal:", error);
            }
        }
    };

    return (
        <div className="analytics-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h3 className="chart-title" style={{ margin: 0 }}>🎯 Custom Goals</h3>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowForm(!showForm)}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                >
                    {showForm ? "Cancel" : "➕ Add Goal"}
                </button>
            </div>

            {showForm && (
                <div style={{ background: "var(--hover-bg)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid var(--border-color)" }}>
                    <form onSubmit={handleAddGoal} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Goal Title</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. Study 2 hours" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="form-label">Target Time (minutes)</label>
                            <input 
                                type="number" 
                                className="form-input" 
                                placeholder="e.g. 120" 
                                value={targetTime} 
                                onChange={e => setTargetTime(e.target.value)} 
                                min="1" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="form-label">Category</label>
                            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                <option>All</option>
                                <option>Study</option>
                                <option>Work</option>
                                <option>Personal</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Timeframe</label>
                            <select className="form-select" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Goal Type</label>
                            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                                <option value="min">At least (Target)</option>
                                <option value="max">At most (Limit)</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
                            <button type="submit" className="btn btn-success" style={{ width: "100%" }}>Save Goal</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {goals.length === 0 ? (
                    <p style={{ color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center" }}>You have no custom goals yet. Click 'Add Goal' to create one!</p>
                ) : (
                    goals.map(goal => {
                        const progressPercent = Math.min((goal.currentProgress / goal.targetTime) * 100, 100);
                        
                        let barColor = "#3b82f6"; // Default blue
                        if (goal.type === "max") {
                            barColor = goal.currentProgress > goal.targetTime ? "#ef4444" : "#10b981"; // Red if exceeded limit, else green
                        } else {
                            barColor = goal.currentProgress >= goal.targetTime ? "#10b981" : "#3b82f6"; // Green if reached min target
                        }

                        return (
                            <div key={goal._id} style={{ position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: "600", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        {goal.title} 
                                        <span style={{ fontSize: "0.75rem", background: "var(--border-color)", padding: "0.1rem 0.5rem", borderRadius: "10px", color: "var(--text-secondary)" }}>
                                            {goal.category} • {goal.timeframe}
                                        </span>
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                            {goal.currentProgress} / {goal.targetTime} min
                                        </span>
                                        <button 
                                            onClick={() => handleDelete(goal._id)}
                                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem", padding: "0" }}
                                            title="Delete goal"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div style={{ width: "100%", height: "12px", background: "var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                                    <div style={{ width: `${progressPercent}%`, height: "100%", background: barColor, transition: "width 0.5s ease-out" }}></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default GoalManager;
