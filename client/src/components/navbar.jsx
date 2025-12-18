import { useNavigate } from "react-router-dom";
import "../App.css";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h2 onClick={() => navigate("/")}>
          ⏱️ Time & Productivity Tracker
        </h2>
        
        <div className="navbar-buttons">
          {!isLoggedIn ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          ) : (
            <button 
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
