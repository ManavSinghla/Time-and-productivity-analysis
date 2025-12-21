// Connects React → Backend
const getToken = () => localStorage.getItem("token");

export const fetchTasks = async () => {
  const res = await fetch("http://localhost:5000/api/tasks", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const addTask = async (taskData) => {
  const res = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(taskData),
  });

  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const updateTask = async (id, updatedData) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  return res.json();
};
