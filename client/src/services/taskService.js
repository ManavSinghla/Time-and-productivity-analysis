// Connects React → Backend
export const fetchTasks = async () => {
  const response = await fetch("http://localhost:5000/api/tasks");
  return response.json();
};