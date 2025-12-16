import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        marginBottom: "20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        Time & Productivity
      </h2>
      
      <div>
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{ marginRight: "10px" }}
            >
              Login
            </button>

            <button onClick={() => navigate("/register")}>Register</button>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
