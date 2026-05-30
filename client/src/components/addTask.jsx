import { useState, useEffect } from "react";
import { addTask } from "../services/taskService";
import "../App.css";

function AddTask({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [category, setCategory] = useState("Study");

  // Modes: manual, stopwatch, pomodoro
  const [entryMode, setEntryMode] = useState("manual");

  // Stopwatch state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Pomodoro state
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoPhase, setPomoPhase] = useState("focus"); // focus | break

  // Stopwatch Timer
  useEffect(() => {
    let interval;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  // Pomodoro Timer
  useEffect(() => {
    let interval;
    if (isPomoRunning) {
      interval = setInterval(() => {
        setPomoSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPomoRunning(false);
            if (pomoPhase === "focus") {
              alert("Focus time is over! Take a 5-minute break.");
              setPomoPhase("break");
              return 5 * 60;
            } else {
              alert("Break is over! Ready to focus?");
              setPomoPhase("focus");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoPhase]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStopwatchSave = async () => {
    const minutes = Math.max(1, Math.floor(secondsElapsed / 60));
    if (!title) {
      alert("Please enter a task title before saving!");
      return;
    }
    await addTask({ title, timeSpent: minutes, category });
    resetForm();
  };

  const handlePomoSave = async () => {
    const minutes = pomoPhase === "focus" 
        ? Math.floor((25 * 60 - pomoSecondsLeft) / 60)
        : 25; // if break, focus was 25
    if (minutes === 0) {
        alert("You haven't spent any time yet!");
        return;
    }
    if (!title) {
      alert("Please enter a task title before saving!");
      return;
    }
    await addTask({ title, timeSpent: minutes, category });
    resetForm();
    setEntryMode("manual");
  };

  const resetForm = () => {
    setTitle("");
    setTimeSpent("");
    setCategory("Study");
    setSecondsElapsed(0);
    setIsStopwatchRunning(false);
    setIsPomoRunning(false);
    setPomoPhase("focus");
    setPomoSecondsLeft(25 * 60);
    if (onTaskAdded) onTaskAdded();
  };

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
    resetForm();
  };

  return (
    <div className="task-form" style={{ position: "relative" }}>
      <h2 className="task-form-title">➕ Add New Task</h2>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button 
          type="button"
          className={`btn ${entryMode === "manual" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => setEntryMode("manual")}
        >
          ✏️ Manual
        </button>
        <button 
          type="button"
          className={`btn ${entryMode === "stopwatch" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => setEntryMode("stopwatch")}
        >
          ⏱️ Stopwatch
        </button>
        <button 
          type="button"
          className={`btn ${entryMode === "pomodoro" ? "btn-primary" : "btn-secondary"}`} 
          onClick={() => setEntryMode("pomodoro")}
        >
          🍅 Pomodoro
        </button>
      </div>

      <form onSubmit={handleSubmit} className="task-form-grid" style={{ alignItems: "center" }}>
        <div>
          <label className="form-label" htmlFor="task-title">Task Title</label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={entryMode === "manual"}
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

        {entryMode === "manual" && (
          <>
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
              <label className="form-label" style={{ visibility: "hidden" }}>Submit</label>
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Add Task
              </button>
            </div>
          </>
        )}
      </form>

      {/* Stopwatch UI */}
      {entryMode === "stopwatch" && (
        <div style={{ background: "var(--hover-bg)", padding: "1.5rem", borderRadius: "12px", textAlign: "center", marginTop: "1rem" }}>
          <h3 style={{ fontSize: "3.5rem", margin: "0 0 1rem 0", color: "var(--text-primary)", fontFamily: "monospace", letterSpacing: "2px" }}>
            {formatTime(secondsElapsed)}
          </h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            {!isStopwatchRunning ? (
              <button type="button" className="btn btn-success" onClick={() => setIsStopwatchRunning(true)}>▶️ Start</button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setIsStopwatchRunning(false)}>⏸️ Pause</button>
            )}
            <button type="button" className="btn btn-danger" onClick={() => { setIsStopwatchRunning(false); setSecondsElapsed(0); }}>⏹️ Reset</button>
            <button type="button" className="btn btn-primary" onClick={handleStopwatchSave}>💾 Stop & Save Task</button>
          </div>
        </div>
      )}

      {/* Pomodoro UI */}
      {entryMode === "pomodoro" && (
        <div style={{ background: pomoPhase === "focus" ? "var(--bg-danger)" : "var(--bg-success)", padding: "1.5rem", borderRadius: "12px", textAlign: "center", marginTop: "1rem", transition: "background 0.3s" }}>
          <h4 style={{ margin: 0, color: pomoPhase === "focus" ? "var(--text-danger)" : "var(--text-success)", fontSize: "1.3rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
            {pomoPhase === "focus" ? "🍅 Focus Time" : "☕ Break Time"}
          </h4>
          <h3 style={{ fontSize: "3.5rem", margin: "0.5rem 0 1rem 0", color: "var(--text-primary)", fontFamily: "monospace", letterSpacing: "2px" }}>
            {formatTime(pomoSecondsLeft)}
          </h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            {!isPomoRunning ? (
              <button type="button" className="btn btn-success" onClick={() => setIsPomoRunning(true)}>▶️ Start</button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setIsPomoRunning(false)}>⏸️ Pause</button>
            )}
            <button type="button" className="btn btn-danger" onClick={() => { setIsPomoRunning(false); setPomoSecondsLeft(pomoPhase === "focus" ? 25*60 : 5*60); }}>⏹️ Reset</button>
            <button type="button" className="btn btn-primary" onClick={handlePomoSave}>💾 Save as Task</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddTask;
