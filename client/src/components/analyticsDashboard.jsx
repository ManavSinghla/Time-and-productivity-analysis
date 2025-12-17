import { useEffect, useState } from "react";
import { fetchTodayTotal, fetchCategoryAnalytics, fetchDailyAnalytics, fetchWeeklyAnalytics, fetchProductivityScore, fetchTodayProductivity, fetchWeeklyProductivity } from "../services/analyticsService";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ProductivityMeter from "./ProductivityMeter";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function AnalyticsDashboard({ refreshTrigger }) {
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
        <div>

            <div style={{ marginBottom: "10px" }}>
                <button onClick={() => setTimeframe("today")}>
                    Today
                </button>
                <button onClick={() => setTimeframe("week")} style={{ marginLeft: "10px" }}>
                    This Week
                </button>
            </div>
            {productivity && (
                <>
                    <ProductivityMeter score={productivity.productivityScore} />
                    <p>
                        Productive Time: {productivity.productiveTime} / {productivity.totalTime} minutes
                    </p>
                </>
            )}


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
