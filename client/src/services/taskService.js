// Connects React → Backend
export const fetchTasks = async () => {
  const response = await fetch("http://localhost:5000/api/tasks");
  return response.json();
};

export const addTask = async (taskData) => {
  const response = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  return response.json();
};

export const deleteTask = async (id) => {
  await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: "DELETE",
  });
};
