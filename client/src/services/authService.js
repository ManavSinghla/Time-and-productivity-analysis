import { getBaseApiUrl } from "../utils";

const API_URL = `${getBaseApiUrl()}/api/auth`;

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
};

export const loginUser = async (userData) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return res.json();
};

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });
  return res.json();
};

export const deleteAccount = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};