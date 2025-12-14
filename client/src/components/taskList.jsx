import { useEffect, useState } from "react";
import { fetchTasks } from "../services/taskService";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks().then((data) => setTasks(data));
  }, []);

  return (
    <div>
      <h2>Tasks</h2>

      {tasks.length === 0 && <p>No tasks found</p>}

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <strong>{task.title}</strong> - {task.timeSpent} minutes
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
