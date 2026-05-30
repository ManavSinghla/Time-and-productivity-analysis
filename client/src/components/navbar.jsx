import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

function Navbar({ isOpen, toggleSidebar, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isLoggedIn) {
      return (
          <div style={{ padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
              <div className="sidebar-logo" style={{ marginBottom: 0 }}>
                  <span style={{ color: "var(--accent-indigo)", fontSize: "2rem" }}>◓</span> Taskly
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn btn-secondary" onClick={toggleTheme}>
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/login")}>Login</button>
                <button className="btn btn-primary" onClick={() => navigate("/register")}>Register</button>
              </div>
          </div>
      );
  }

  return (
    <>
      {!isOpen && (
        <button 
          onClick={toggleSidebar} 
          style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 1000, background: 'var(--card-bg)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          <span style={{ fontSize: '1.5rem' }}>☰</span>
        </button>
      )}
      <aside className={`sidebar ${isOpen ? "" : "closed"}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
          <div className="sidebar-logo" style={{ marginBottom: 0 }} onClick={() => navigate("/")}>
            <span style={{ color: "var(--accent-indigo)", fontSize: "2rem", display: "inline-block", transform: "rotate(45deg)" }}>◓</span> Taskly
          </div>
          <button onClick={toggleSidebar} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-secondary)" }}>
            ✕
          </button>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <span style={{ fontSize: "1.2rem" }}>🏠</span> Dashboard
          </button>
          {/* Note: Tasks and Activity currently just navigate to Dashboard since they are part of it */}
          <button 
            className="sidebar-link"
            onClick={() => {
                navigate("/dashboard");
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📋</span> Tasks List
          </button>
          <button 
            className="sidebar-link"
            onClick={() => {
                navigate("/dashboard");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📊</span> Activity
          </button>
        </div>

      <div className="sidebar-bottom">
        <button 
          className="sidebar-link"
          onClick={toggleTheme}
        >
          <span style={{ fontSize: "1.2rem" }}>{theme === 'dark' ? '☀️' : '🌙'}</span> {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button 
          className={`sidebar-link ${location.pathname === "/settings" ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <span style={{ fontSize: "1.2rem" }}>⚙️</span> Settings
        </button>
        <button 
          className="sidebar-link"
          onClick={handleLogout}
          style={{ color: "#ef4444" }}
        >
          <span style={{ fontSize: "1.2rem" }}>🚪</span> Logout
        </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
