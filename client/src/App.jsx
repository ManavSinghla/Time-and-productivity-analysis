import './App.css';
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/Register";
import TaskList from "./components/TaskList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <AnalyticsDashboard refreshTrigger={refreshTrigger} />
      <TaskList onTaskChange={handleTaskChange} />
    </>
  );
}

function App() {
  return (
    <Router>
      <Navbar />

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

        {/* Default Redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem("token") ? "/dashboard" : "/login"}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
