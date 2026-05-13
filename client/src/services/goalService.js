import { getBaseApiUrl } from "../utils";

const API_BASE_URL = getBaseApiUrl();
const getToken = () => localStorage.getItem("token");

export const fetchGoals = async () => {
  const res = await fetch(`${API_BASE_URL}/api/goals`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const createGoal = async (goalData) => {
  const res = await fetch(`${API_BASE_URL}/api/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(goalData),
  });
  return res.json();
};

export const deleteGoal = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};
