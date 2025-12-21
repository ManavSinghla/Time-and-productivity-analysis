import { useEffect, useState } from "react";
import { fetchTodayTotal, fetchCategoryAnalytics, fetchDailyAnalytics, fetchWeeklyAnalytics, fetchProductivityScore, fetchTodayProductivity, fetchWeeklyProductivity } from "../services/analyticsService";
import { getCurrentUser } from "../services/authService";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProductivityMeter from "./productivityMeter";
import "../App.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AnalyticsDashboard({ refreshTrigger }) {
    const [userName, setUserName] = useState("");
    const [todayTotal, setTodayTotal] = useState(0);
    const [categoryData, setCategoryData] = useState([]);
    const [dailyData, setDailyData] = useState([]);

    const loadAnalytics = async () => {
        try {
            const todayData = await fetchTodayTotal();
            setTodayTotal(todayData.totalTime || 0);
            
            const categoryData = await fetchCategoryAnalytics();
            setCategoryData(categoryData || []);
            
            const dailyData = await fetchDailyAnalytics();
            setDailyData(dailyData || []);
        } catch (error) {
            console.error("Error loading analytics:", error);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [refreshTrigger]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedName = localStorage.getItem("userName");
                if (storedName) {
                    setUserName(storedName);
                } else {
                    const userData = await getCurrentUser();
                    if (userData.name) {
                        setUserName(userData.name);
                        localStorage.setItem("userName", userData.name);
                    }
                }
            } catch (error) {
                console.error("Error loading user:", error);
            }
        };
        loadUser();
    }, []);

    const [weeklyData, setWeeklyData] = useState([]);
    useEffect(() => {
        const loadWeekly = async () => {
            try {
                const data = await fetchWeeklyAnalytics();
                setWeeklyData(data || []);
            } catch (error) {
                console.error("Error loading weekly analytics:", error);
                setWeeklyData([]);
            }
        };
        loadWeekly();
    }, [refreshTrigger]);

    const [timeframe, setTimeframe] = useState("today");
    const [productivity, setProductivity] = useState(null);
    useEffect(() => {
        const loadProductivity = async () => {
            try {
                const data = timeframe === "today" 
                    ? await fetchTodayProductivity() 
                    : await fetchWeeklyProductivity();
                setProductivity(data);
            } catch (error) {
                console.error("Error fetching productivity:", error);
                setProductivity({ productivityScore: 0, productiveTime: 0, totalTime: 0 });
            }
        };
        loadProductivity();
    }, [timeframe, refreshTrigger]);

    return (
        <div className="container">
            <div className="analytics-container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 className="analytics-header">📈 Analytics Dashboard</h1>
                        {userName && (
                            <p className="analytics-subtitle" style={{ marginTop: "0.5rem", fontSize: "1.1rem", fontWeight: "600", color: "#667eea" }}>
                                Welcome back, <span style={{ textTransform: "capitalize" }}>{userName}</span>! 👋
                            </p>
                        )}
                    </div>
                </div>
                <p className="analytics-subtitle">Track your productivity and time management</p>

                <div className="timeframe-toggle">
                    <button
                        className={timeframe === "today" ? "timeframe-btn active" : "timeframe-btn"}
                        onClick={() => setTimeframe("today")}
                    >
                        📅 Today
                    </button>
                    <button
                        className={timeframe === "week" ? "timeframe-btn active" : "timeframe-btn"}
                        onClick={() => setTimeframe("week")}
                    >
                        📆 This Week
                    </button>
                </div>

                {productivity && (
                    <>
                        <ProductivityMeter score={productivity.productivityScore} />
                        <div className="productivity-info">
                            <p>
                                Productive Time: <strong>{productivity.productiveTime}</strong> /{" "}
                                <strong>{productivity.totalTime}</strong> minutes
                            </p>
                        </div>
                    </>
                )}

                <div className="stats-card">
                    <h3 className="stats-title">⏱️ Total Time Today</h3>
                    <p className="stats-value">{todayTotal} minutes</p>
                </div>
            </div>

            <div className="analytics-container">
                <h3 className="chart-title">📊 Time Spent by Category</h3>
                {categoryData.length > 0 ? (
                    <div className="chart-container">
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
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No category data available</p>
                    </div>
                )}
            </div>

            <div className="analytics-container">
                <h3 className="chart-title">📅 Daily Productivity</h3>
                {dailyData.length > 0 ? (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyData}>
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalTime" fill="#667eea" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No daily data available</p>
                    </div>
                )}
            </div>

            <div className="analytics-container">
                <h3 className="chart-title">📈 Weekly Productivity Trend</h3>
                {weeklyData.length > 0 ? (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyData}>
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="totalTime" stroke="#667eea" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No weekly data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
