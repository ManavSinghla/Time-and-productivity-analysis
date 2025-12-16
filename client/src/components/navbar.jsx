function Navbar({ isLoggedIn, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
        padding: "10px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <h2>Time & Productivity</h2>

      {isLoggedIn && (
        <button onClick={onLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

export default Navbar;
