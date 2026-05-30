import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/register";
import TaskList from "./components/taskList";
import AnalyticsDashboard from "./components/analyticsDashboard";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protectedRoute";
import Settings from "./components/settings";
import CalendarView from "./components/calendarView";
import Leaderboard from "./components/leaderboard";

function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="dashboard-container" style={{ background: "transparent", padding: 0 }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem" }}>
        <button 
          className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button 
          className={`btn ${activeTab === "calendar" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("calendar")}
        >
          📅 Calendar
        </button>
        <button 
          className={`btn ${activeTab === "leaderboard" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          🏆 Leaderboard
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          <AnalyticsDashboard refreshTrigger={refreshTrigger} />
          <TaskList onTaskChange={handleTaskChange} />
        </>
      )}

      {activeTab === "calendar" && <CalendarView refreshTrigger={refreshTrigger} />}
      
      {activeTab === "leaderboard" && <Leaderboard />}
    </div>
  );
}

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={isAuthRoute ? "" : "dashboard-layout"}>
      <Navbar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} theme={theme} toggleTheme={toggleTheme} />
      <div className={isAuthRoute ? "" : `main-content ${sidebarOpen ? "" : "collapsed"}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route
            path="*"
            element={
              <Navigate
                to={localStorage.getItem("token") ? "/dashboard" : "/login"}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
