import './App.css';
import { useEffect, useState } from "react";
import Login from "./components/login";
import Register from "./components/register";
import TaskList from "./components/TaskList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Navbar from "./components/navbar";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      {!isLoggedIn ? (
        <>
          <Register />
          <Login onLogin={() => setIsLoggedIn(true)} />
        </>
      ) : (
        <>
          <AnalyticsDashboard />
          <TaskList />
        </>
      )}
    </div>
  );
}

export default App;
