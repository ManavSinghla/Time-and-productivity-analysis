function ProductivityMeter({ score }) {
  // Decide color based on score
  const getColor = () => {
    if (score < 40) return "#e74c3c"; // red
    if (score < 70) return "#f1c40f"; // yellow
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
            width: `${score}%`,
            height: "100%",
            backgroundColor: getColor(),
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <p style={{ marginTop: "8px" }}>
        {score}% productive
      </p>
    </div>
  );
}

export default ProductivityMeter;
