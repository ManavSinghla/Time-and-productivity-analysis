import { getBaseApiUrl } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getBaseApiUrl();
const getToken = () => localStorage.getItem("token");

export const fetchTodayTotal = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/today`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchCategoryAnalytics = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/category`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchDailyAnalytics = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/daily`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchWeeklyAnalytics = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/weekly`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchProductivityScore = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/productivity`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchTodayProductivity = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/productivity/today`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const fetchWeeklyProductivity = async () => {
  const res = await fetch(`${API_BASE_URL}/api/analytics/productivity/week`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
};
