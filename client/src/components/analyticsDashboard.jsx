import { useEffect, useState } from "react";
import { fetchTodayTotal, fetchCategoryAnalytics, fetchDailyAnalytics, fetchWeeklyAnalytics, fetchProductivityScore, fetchTodayProductivity, fetchWeeklyProductivity, fetchGamificationStats, fetchGoalsStats } from "../services/analyticsService";
import { getCurrentUser } from "../services/authService";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProductivityMeter from "./productivityMeter";
import GoalManager from "./goalManager";
import { fetchTasks } from "../services/taskService";
import { fetchGoals } from "../services/goalService";
import "../App.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AnalyticsDashboard({ refreshTrigger }) {
    const [userName, setUserName] = useState("");
    const [userPrefs, setUserPrefs] = useState({ dailyGoal: 120 });
    const [todayTotal, setTodayTotal] = useState(0);
    const [categoryData, setCategoryData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [timeframe, setTimeframe] = useState("today");
    const [productivity, setProductivity] = useState(null);
    const [gamification, setGamification] = useState(null);

    // Advanced analytics states
    const [allTasks, setAllTasks] = useState([]);
    const [goalsList, setGoalsList] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState("");
    const [aiSummary, setAiSummary] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [peakHoursData, setPeakHoursData] = useState([]);
    const [burndownData, setBurndownData] = useState([]);

    const loadAnalytics = async () => {
        try {
            const todayData = await fetchTodayTotal();
            setTodayTotal(todayData.totalTime || 0);
            
            const catData = await fetchCategoryAnalytics();
            setCategoryData(catData || []);
            
            const dData = await fetchDailyAnalytics();
            setDailyData(dData || []);

            const wData = await fetchWeeklyAnalytics();
            setWeeklyData(wData || []);
        } catch (error) {
            console.error("Error loading analytics:", error);
        }
    };

    const loadAdvancedData = async () => {
        try {
            const tasks = await fetchTasks();
            setAllTasks(tasks || []);
            
            const goals = await fetchGoals();
            setGoalsList(goals || []);
            
            // Set initial selected goal if not set yet
            if (goals && goals.length > 0 && !selectedGoalId) {
                setSelectedGoalId(goals[0]._id);
            }
            
            computeAdvancedMetrics(tasks || [], goals || []);
        } catch (error) {
            console.error("Error loading advanced data:", error);
        }
    };

    const computeAdvancedMetrics = (tasks, goals) => {
        const now = new Date();
        
        // 1. AI Weekly Summary Calculations
        const startOfThisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const startOfLastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const thisWeekTasks = tasks.filter(t => new Date(t.date || t.createdAt) >= startOfThisWeek);
        const lastWeekTasks = tasks.filter(t => {
            const d = new Date(t.date || t.createdAt);
            return d >= startOfLastWeek && d < startOfThisWeek;
        });
        
        const totalThisWeek = thisWeekTasks.reduce((sum, t) => sum + t.timeSpent, 0);
        const totalLastWeek = lastWeekTasks.reduce((sum, t) => sum + t.timeSpent, 0);
        
        let pctChange = 0;
        if (totalLastWeek > 0) {
            pctChange = Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100);
        } else if (totalThisWeek > 0) {
            pctChange = 100;
        }
        
        const cats = {};
        thisWeekTasks.forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.timeSpent;
        });
        let topCategory = "None";
        let maxCatTime = 0;
        Object.keys(cats).forEach(c => {
            if (cats[c] > maxCatTime) {
                maxCatTime = cats[c];
                topCategory = c;
            }
        });
        
        const hours = Array(24).fill(0);
        tasks.forEach(t => {
            const h = new Date(t.date || t.createdAt).getHours();
            hours[h] += t.timeSpent;
        });
        
        let peakHour = 0;
        let maxHourTime = 0;
        hours.forEach((time, h) => {
            if (time > maxHourTime) {
                maxHourTime = time;
                peakHour = h;
            }
        });
        
        const peakHourString = `${peakHour % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}`;
        
        let textSummary = "";
        if (totalThisWeek === 0) {
            textSummary = "You haven't logged any time this week. Start a task to begin receiving AI-powered reviews!";
        } else {
            const performanceWord = pctChange >= 0 ? "more active" : "less active";
            const changeAbs = Math.abs(pctChange);
            textSummary = `Fantastic job! You've logged ${totalThisWeek} minutes of focused activity this week. You were ${changeAbs}% ${performanceWord} compared to last week, with your primary focus being on the "${topCategory}" category. Your peak performance hours occur around ${peakHourString}, suggesting this is when your concentration is highest. Keep up this excellent routine!`;
        }
        
        setAiSummary({
            totalThisWeek,
            totalLastWeek,
            pctChange,
            topCategory,
            peakHourString,
            textSummary
        });
        
        // 2. Heatmap Calculations (120 Days)
        const taskMap = {};
        tasks.forEach(t => {
            const dStr = new Date(t.date || t.createdAt).toISOString().split('T')[0];
            taskMap[dStr] = (taskMap[dStr] || 0) + t.timeSpent;
        });
        
        const tempHeatmap = [];
        for (let i = 119; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dStr = d.toISOString().split('T')[0];
            const mins = taskMap[dStr] || 0;
            
            let level = 0;
            if (mins > 0 && mins <= 30) level = 1;
            else if (mins > 30 && mins <= 90) level = 2;
            else if (mins > 90 && mins <= 180) level = 3;
            else if (mins > 180) level = 4;
            
            tempHeatmap.push({
                dateStr: dStr,
                displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                mins,
                level
            });
        }
        setHeatmapData(tempHeatmap);
        
        // 3. Peak Hour Chart Data
        const peakData = [];
        for (let h = 0; h < 24; h++) {
            const label = `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
            peakData.push({
                hourLabel: label,
                minutes: hours[h]
            });
        }
        setPeakHoursData(peakData);
        
        // 4. Goal Burndown Calculations
        const activeGoalId = selectedGoalId || (goals.length > 0 ? goals[0]._id : "");
        const selectedGoal = goals.find(g => g._id === activeGoalId);
        if (selectedGoal) {
            const target = selectedGoal.targetTime;
            const timeframe = selectedGoal.timeframe;
            const burnData = [];
            
            if (timeframe === 'daily') {
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);
                const todayTasks = tasks.filter(t => new Date(t.date || t.createdAt) >= startOfToday);
                
                let remaining = target;
                const currentHour = new Date().getHours();
                for (let h = 0; h <= currentHour; h++) {
                    const label = `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
                    const hourTasks = todayTasks.filter(t => new Date(t.date || t.createdAt).getHours() === h);
                    const hourSpent = hourTasks.reduce((sum, t) => sum + t.timeSpent, 0);
                    remaining = Math.max(0, remaining - hourSpent);
                    
                    burnData.push({
                        label,
                        remaining,
                        targetLine: Math.max(0, Math.round(target - (target / 24) * h))
                    });
                }
            } else {
                const startOfThisWeek = new Date();
                startOfThisWeek.setDate(startOfThisWeek.getDate() - 6);
                startOfThisWeek.setHours(0, 0, 0, 0);
                const weeklyTasks = tasks.filter(t => new Date(t.date || t.createdAt) >= startOfThisWeek);
                
                let remaining = target;
                for (let d = 0; d < 7; d++) {
                    const checkDate = new Date(startOfThisWeek.getTime() + d * 24 * 60 * 60 * 1000);
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    const dayTasks = weeklyTasks.filter(t => new Date(t.date || t.createdAt).toISOString().split('T')[0] === checkDateStr);
                    const daySpent = dayTasks.reduce((sum, t) => sum + t.timeSpent, 0);
                    remaining = Math.max(0, remaining - daySpent);
                    
                    burnData.push({
                        label: checkDate.toLocaleDateString(undefined, { weekday: 'short' }),
                        remaining,
                        targetLine: Math.max(0, Math.round(target - (target / 7) * (d + 1)))
                    });
                }
            }
            setBurndownData(burnData);
        } else {
            setBurndownData([]);
        }
    };

    useEffect(() => {
        loadAnalytics();
        loadAdvancedData();
    }, [refreshTrigger, selectedGoalId]);

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

            {/* AI Summary Card */}
            {aiSummary && (
                <div className="ai-summary-card">
                    <h3 className="ai-summary-title">
                        🤖 AI Weekly Summary
                        <span className="ai-summary-badge">Auto-Generated</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: "1.6", color: "var(--text-primary)" }}>
                        {aiSummary.textSummary}
                    </p>
                    <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "0.8rem 1.2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>This Week</span>
                            <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.5rem", fontWeight: "800" }}>{aiSummary.totalThisWeek} min</h4>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "0.8rem 1.2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>VS Last Week</span>
                            <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.5rem", fontWeight: "800", color: aiSummary.pctChange >= 0 ? "#10b981" : "#ef4444" }}>
                                {aiSummary.pctChange >= 0 ? `+${aiSummary.pctChange}%` : `${aiSummary.pctChange}%`}
                            </h4>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "0.8rem 1.2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>Primary Focus</span>
                            <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-indigo)" }}>{aiSummary.topCategory}</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Heatmap Activity Calendar */}
            {heatmapData.length > 0 && (
                <div className="heatmap-container" style={{ marginBottom: "2rem" }}>
                    <h3 className="chart-title" style={{ margin: 0 }}>🔥 Daily Activity Heatmap</h3>
                    
                    <div className="heatmap-layout-wrapper">
                        {/* Weekday labels */}
                        <div className="heatmap-weekdays">
                            <span>Sun</span>
                            <span></span>
                            <span>Tue</span>
                            <span></span>
                            <span>Thu</span>
                            <span></span>
                            <span>Sat</span>
                        </div>
                        
                        <div className="heatmap-grid-container">
                            {/* Months header */}
                            <div className="heatmap-months-header">
                                {(() => {
                                    const months = [];
                                    for (let i = 0; i < heatmapData.length; i += 7 * 4) {
                                        if (heatmapData[i]) {
                                            const mName = new Date(heatmapData[i].dateStr).toLocaleDateString(undefined, { month: 'short' });
                                            if (!months.includes(mName)) {
                                                months.push(mName);
                                            }
                                        }
                                    }
                                    return months.map((m, idx) => <span key={idx}>{m}</span>);
                                })()}
                            </div>
                            
                            {/* Grid columns */}
                            <div className="heatmap-grid">
                                {Array.from({ length: Math.ceil(heatmapData.length / 7) }).map((_, colIdx) => (
                                    <div key={colIdx} className="heatmap-column">
                                        {heatmapData.slice(colIdx * 7, colIdx * 7 + 7).map((day, cellIdx) => (
                                            <div 
                                                key={cellIdx} 
                                                className={`heatmap-cell heatmap-level-${day.level}`}
                                                style={{ color: day.level > 0 ? "var(--accent-indigo)" : "transparent" }}
                                            >
                                                <div className="heatmap-tooltip">
                                                    {day.displayDate}: {day.mins} mins
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
                        <span>Less</span>
                        <div className="heatmap-cell heatmap-level-0" style={{ width: 12, height: 12 }}></div>
                        <div className="heatmap-cell heatmap-level-1" style={{ width: 12, height: 12 }}></div>
                        <div className="heatmap-cell heatmap-level-2" style={{ width: 12, height: 12 }}></div>
                        <div className="heatmap-cell heatmap-level-3" style={{ width: 12, height: 12 }}></div>
                        <div className="heatmap-cell heatmap-level-4" style={{ width: 12, height: 12 }}></div>
                        <span>More</span>
                    </div>
                </div>
            )}

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

            {/* Advanced Analytical Grid */}
            <div className="dashboard-grid" style={{ marginTop: "2rem" }}>
                {/* Peak Productivity Hour Analysis */}
                <div className="analytics-container" style={{ margin: 0 }}>
                    <h3 className="chart-title">⏱️ Peak Productivity Hours</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                        Hourly distribution representing task logging frequency and session durations.
                    </p>
                    <div style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHoursData.some(d => d.minutes > 0) ? peakHoursData : peakHoursData.slice(8, 22)}>
                                <XAxis dataKey="hourLabel" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--card-bg)", borderColor: "var(--border-color)", borderRadius: 8, color: "var(--text-primary)" }} />
                                <Bar dataKey="minutes" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} name="Logged Minutes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Goal Burndown Timeline */}
                <div className="analytics-container" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <h3 className="chart-title" style={{ margin: 0 }}>📉 Goal Burndown Timeline</h3>
                        {goalsList.length > 0 && (
                            <select 
                                className="form-select" 
                                style={{ width: "auto", padding: "0.3rem 1.5rem 0.3rem 0.75rem", fontSize: "0.85rem" }}
                                value={selectedGoalId}
                                onChange={(e) => setSelectedGoalId(e.target.value)}
                            >
                                {goalsList.map(g => (
                                    <option key={g._id} value={g._id}>{g.title}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    {goalsList.length > 0 ? (
                        <>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                Target burndown pace versus actual remaining minutes.
                            </p>
                            <div style={{ height: "300px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={burndownData}>
                                        <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                                        <YAxis stroke="var(--text-secondary)" fontSize={9} tickLine={false} />
                                        <Tooltip contentStyle={{ background: "var(--card-bg)", borderColor: "var(--border-color)", borderRadius: 8, color: "var(--text-primary)" }} />
                                        <Line type="monotone" dataKey="remaining" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} name="Remaining Target" />
                                        <Line type="monotone" dataKey="targetLine" stroke="var(--text-secondary)" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Ideal Pace" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <p>Create a custom goal above to unlock its burndown timeline!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;
