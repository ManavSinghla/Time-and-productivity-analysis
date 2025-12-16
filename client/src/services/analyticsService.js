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
export const fetchWeeklyAnalytics = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/weekly");
  return res.json();
};
export const fetchProductivityScore = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/productivity");
  return res.json();
};
export const fetchTodayProductivity = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/productivity/today");
  return res.json();
};
export const fetchWeeklyProductivity = async () => {
  const res = await fetch("http://localhost:5000/api/analytics/productivity/week");
  return res.json();
};
