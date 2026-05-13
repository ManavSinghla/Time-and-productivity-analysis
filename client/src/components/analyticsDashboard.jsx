import { useEffect, useState } from "react";
import { fetchTodayTotal, fetchCategoryAnalytics, fetchDailyAnalytics, fetchWeeklyAnalytics, fetchProductivityScore, fetchTodayProductivity, fetchWeeklyProductivity, fetchGamificationStats, fetchGoalsStats } from "../services/analyticsService";
import { getCurrentUser } from "../services/authService";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProductivityMeter from "./productivityMeter";
import GoalManager from "./goalManager";
import { fetchTasks } from "../services/taskService";
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

    const [gamification, setGamification] = useState(null);
    useEffect(() => {
        const loadGamification = async () => {
            try {
                const data = await fetchGamificationStats();
                setGamification(data);
            } catch (error) {
                console.error("Error fetching gamification:", error);
            }
        };
        loadGamification();
    }, [refreshTrigger]);

    const handleExportCSV = async () => {
        try {
            const tasks = await fetchTasks();
            if (!tasks || tasks.length === 0) {
                alert("No tasks available to export.");
                return;
            }

            const headers = ["Title,Time Spent (minutes),Category,Date"];
            
            const rows = tasks.map(task => {
                const date = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
                const title = `"${task.title.replace(/"/g, '""')}"`;
                return `${title},${task.timeSpent},${task.category},${date}`;
            });

            const csvContent = headers.concat(rows).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `productivity_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert("Failed to export tasks. Please try again.");
        }
    };

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
                    <button 
                        onClick={handleExportCSV}
                        className="btn btn-secondary"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "2px solid #667eea" }}
                    >
                        📥 Export to CSV
                    </button>
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

            <GoalManager refreshTrigger={refreshTrigger} />

            {gamification && (
                <div className="analytics-container">
                    <h3 className="chart-title">🎮 Your Achievements</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        <div className="stats-card" style={{ flex: '1', minWidth: '200px', margin: 0, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                            <h3 className="stats-title">🔥 Current Streak</h3>
                            <p className="stats-value">{gamification.currentStreak} Days</p>
                        </div>
                        <div className="stats-card" style={{ flex: '1', minWidth: '200px', margin: 0, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <h3 className="stats-title">⏱️ Total Logged</h3>
                            <p className="stats-value" style={{ fontSize: '2.5rem' }}>{Math.floor(gamification.totalTimeLogged / 60)}h {gamification.totalTimeLogged % 60}m</p>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#374151' }}>Badges Earned ({gamification.badges.length})</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {gamification.badges.map((badge, idx) => (
                            <div key={idx} style={{ 
                                background: '#f3f4f6', 
                                padding: '1rem', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                border: '2px solid #e5e7eb',
                                minWidth: '250px'
                            }}>
                                <span style={{ fontSize: '2.5rem' }}>{badge.icon}</span>
                                <div>
                                    <p style={{ fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{badge.name}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>{badge.description}</p>
                                </div>
                            </div>
                        ))}
                        {gamification.badges.length === 0 && (
                            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Complete tasks to earn your first badge!</p>
                        )}
                    </div>
                </div>
            )}

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
