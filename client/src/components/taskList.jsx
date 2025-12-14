import { useEffect, useState } from "react";
import { fetchTasks } from "../services/taskService";
import AddTask from "./addTask";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = () => {
    fetchTasks().then((data) => setTasks(data));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div>
      <AddTask onTaskAdded={loadTasks} />

      <h2>Tasks</h2>

      {tasks.length === 0 && <p>No tasks found</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <strong>{task.title}</strong> – {task.timeSpent} min ({task.category})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
