export const fetchTodayTotal = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/today");
  return res.json();
};

export const fetchCategoryAnalytics = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/category");
  return res.json();
};

export const fetchDailyAnalytics = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/daily");
  return res.json();
};
