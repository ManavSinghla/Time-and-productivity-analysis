function ProductivityMeter({ score }) {
  // Handle edge cases: undefined, null, or NaN
  const safeScore = score !== null && score !== undefined && !isNaN(score) 
    ? Math.max(0, Math.min(100, Number(score))) 
    : 0;

  // Decide color based on score
  const getColor = () => {
    if (safeScore < 40) return "#e74c3c"; // red
    if (safeScore < 70) return "#f1c40f"; // yellow
    return "#2ecc71"; // green
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <h3>Productivity Meter</h3>

      {/* Outer bar */}
      <div
        style={{
          width: "100%",
          height: "25px",
          backgroundColor: "#ddd",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Inner filled bar */}
        <div
          style={{
            width: `${safeScore}%`,
            height: "100%",
            backgroundColor: getColor(),
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <p style={{ marginTop: "8px" }}>
        {safeScore}% productive
      </p>
    </div>
  );
}

export default ProductivityMeter;
