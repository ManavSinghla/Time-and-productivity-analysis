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
    const [userPrefs, setUserPrefs] = useState({ dailyGoal: 120 });
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
                    if (userData) {
                        if (userData.name) {
                            setUserName(userData.name);
                            localStorage.setItem("userName", userData.name);
                        }
                        if (userData.preferences) {
                            setUserPrefs(userData.preferences);
                        }
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

    const getSmartInsights = () => {
        const insights = [];
        
        if (todayTotal === 0) {
            insights.push({ type: "warning", icon: "🔔", text: "You have not logged time today." });
        } else {
            if (todayTotal >= userPrefs.dailyGoal) {
                insights.push({ type: "success", icon: "🌟", text: "You reached your daily goal!" });
            }
            if (todayTotal >= 50 && todayTotal < 60) {
                insights.push({ type: "info", icon: "☕", text: "You have been working for 50 minutes. Take a break!" });
            } else if (todayTotal >= 120 && todayTotal % 120 < 20) {
                insights.push({ type: "info", icon: "☕", text: "You've logged a lot of time. Remember to take regular breaks!" });
            }
        }

        if (productivity && productivity.productivityScore < 40) {
            insights.push({ type: "warning", icon: "📉", text: "Your productivity is below your weekly average. Try focusing on Work or Study tasks!" });
        }

        return insights;
    };
    const insights = getSmartInsights();

    const handleNotificationsClick = () => {
        if (insights.length > 0) {
            alert(`You have ${insights.length} new insights!\n\n${insights.map(i => `${i.icon} ${i.text}`).join('\n')}`);
        } else {
            alert("No new notifications at the moment!");
        }
    };

    return (
        <div className="container" style={{ padding: 0 }}>
            {/* Top Bar */}
            <div className="top-bar">
                <div>
                    <h1 className="welcome-text">
                        Welcome, <span style={{ textTransform: "capitalize" }}>{userName || "User"}</span>!
                    </h1>
                    <p className="welcome-sub">Automate tasks and achieve more every day.</p>
                </div>
                <div className="top-actions">
                    <div className="pill-badge">
                        {todayTotal > 0 ? "🔥 You're active today" : "💤 Start your first task"}
                    </div>
                    <button className="btn-icon" onClick={handleNotificationsClick} title="Notifications">🔔</button>
                    <button className="btn-icon btn-icon-dark" onClick={handleExportCSV} title="Export to CSV">📥</button>
                </div>
            </div>

            {insights.length > 0 && (
                    <div style={{ background: "var(--hover-bg)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1rem", marginBottom: "2rem" }}>
                        <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            💡 Smart Reminders
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {insights.map((insight, idx) => (
                                <div key={idx} style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.75rem",
                                    padding: "0.75rem 1rem",
                                    background: insight.type === "warning" ? "var(--bg-warning)" : insight.type === "success" ? "var(--bg-success)" : "var(--bg-info)",
                                    color: insight.type === "warning" ? "var(--text-warning)" : insight.type === "success" ? "var(--text-success)" : "var(--text-info)",
                                    borderRadius: "8px",
                                    borderLeft: `4px solid ${insight.type === "warning" ? "#f59e0b" : insight.type === "success" ? "#22c55e" : "#3b82f6"}`
                                }}>
                                    <span style={{ fontSize: "1.2rem" }}>{insight.icon}</span>
                                    <span style={{ fontWeight: "500" }}>{insight.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="dashboard-grid">
                
                {/* Left Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    
                    <GoalManager refreshTrigger={refreshTrigger} />

                    <div className="analytics-container" style={{ margin: 0 }}>
                        <div className="timeframe-toggle" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", display: "flex" }}>
                            <h3 className="chart-title" style={{ margin: 0 }}>Productivity</h3>
                            <div className="timeframe-group">
                                <button
                                    className={timeframe === "today" ? "timeframe-btn active" : "timeframe-btn"}
                                    onClick={() => setTimeframe("today")}
                                >
                                    Today
                                </button>
                                <button
                                    className={timeframe === "week" ? "timeframe-btn active" : "timeframe-btn"}
                                    onClick={() => setTimeframe("week")}
                                >
                                    Week
                                </button>
                            </div>
                        </div>

                        {productivity && (
                            <>
                                <ProductivityMeter score={productivity.productivityScore} />
                                <div style={{ 
                                    background: "rgba(96, 165, 250, 0.1)", 
                                    padding: "1rem", 
                                    borderRadius: "12px", 
                                    textAlign: "center",
                                    color: "var(--accent-blue)",
                                    fontWeight: "600",
                                    marginTop: "1rem"
                                }}>
                                    Productive Time: {productivity.productiveTime} / {productivity.totalTime} minutes
                                </div>
                            </>
                        )}
                        
                        <div style={{ 
                            background: "rgba(129, 140, 248, 0.1)", 
                            padding: "1rem", 
                            borderRadius: "12px", 
                            textAlign: "center",
                            color: "var(--accent-indigo)",
                            fontWeight: "600",
                            marginTop: "1rem"
                        }}>
                            Total Time Today: {todayTotal} minutes
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    
                    {gamification && (
                        <div className="analytics-container" style={{ margin: 0 }}>
                            <h3 className="chart-title">🎮 Achievements</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(129, 140, 248, 0.1)', padding: "1.5rem", borderRadius: "16px", color: "var(--accent-indigo)" }}>
                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Current Streak</h4>
                                    <p style={{ margin: 0, fontSize: "2rem", fontWeight: "800" }}>{gamification.currentStreak} <span style={{fontSize:"1rem"}}>Days</span></p>
                                </div>
                                <div style={{ background: 'var(--bg-success)', padding: "1.5rem", borderRadius: "16px", color: "var(--text-success)" }}>
                                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Total Logged</h4>
                                    <p style={{ margin: 0, fontSize: "2rem", fontWeight: "800" }}>{Math.floor(gamification.totalTimeLogged / 60)}<span style={{fontSize:"1rem"}}>h</span> {gamification.totalTimeLogged % 60}<span style={{fontSize:"1rem"}}>m</span></p>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Badges Earned ({gamification.badges.length})</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {gamification.badges.map((badge, idx) => (
                                    <div key={idx} style={{ 
                                        background: 'var(--hover-bg)', 
                                        padding: '0.75rem', 
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        border: '1px solid var(--border-color)',
                                        flex: "1 1 calc(50% - 0.5rem)"
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                                        <div>
                                            <p style={{ fontWeight: 'bold', margin: 0, color: 'var(--text-primary)', fontSize: "0.9rem" }}>{badge.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{badge.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {gamification.badges.length === 0 && (
                                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: "0.9rem" }}>Complete tasks to earn your first badge!</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="analytics-container" style={{ margin: 0 }}>
                        <h3 className="chart-title">📊 Time Spent by Category</h3>
                        {categoryData.length > 0 ? (
                            <div style={{ height: "300px" }}>
                                <ResponsiveContainer width="100%" height="100%">
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

                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
