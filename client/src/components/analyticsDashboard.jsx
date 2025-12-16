import { useEffect, useState } from "react";
import { fetchTodayTotal, fetchCategoryAnalytics, fetchDailyAnalytics, fetchWeeklyAnalytics, fetchProductivityScore } from "../services/analyticsService";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AnalyticsDashboard() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    fetchTodayTotal().then((data) => setTodayTotal(data.totalTime));
    fetchCategoryAnalytics().then((data) => setCategoryData(data));
    fetchDailyAnalytics().then((data) => setDailyData(data));
  }, []);
  
  const [weeklyData, setWeeklyData] = useState([]);
  useEffect(() => {
    fetchWeeklyAnalytics().then((data) => setWeeklyData(data));
  }, []);

  const [productivity, setProductivity] = useState(null);
  fetchProductivityScore().then((data) => setProductivity(data));
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h3>Productivity Score</h3>
        <p>{productivity.productivityScore}% productive ({productivity.productiveTime} / {productivity.totalTime} minutes) </p>
      </div>
    
      <h2>Productivity Analytics</h2>

      <h3>Total Time Today: {todayTotal} minutes</h3>

      {/* CATEGORY PIE CHART */}
      <h3>Time Spent by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="totalTime"
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* DAILY BAR CHART */}
      <h3>Daily Productivity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dailyData}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalTime" />
        </BarChart>
      </ResponsiveContainer>

      {/* WEEKLY LINE CHART */}
      <h3>Weekly Productivity Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={weeklyData}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="totalTime" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsDashboard;
