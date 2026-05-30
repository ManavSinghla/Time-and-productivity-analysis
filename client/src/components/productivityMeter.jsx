import "../App.css";

function ProductivityMeter({ score }) {
  const safeScore = score !== null && score !== undefined && !isNaN(score) 
    ? Math.max(0, Math.min(100, Number(score))) 
    : 0;

  const getColor = () => {
    if (safeScore < 40) return "#e74c3c";
    if (safeScore < 70) return "#f1c40f";
    return "#2ecc71";
  };

  const getScoreLabel = () => {
    if (safeScore < 40) return "Low";
    if (safeScore < 70) return "Moderate";
    return "High";
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ 
        width: "100%", 
        height: "12px", 
        background: "#e5e7eb", 
        borderRadius: "20px", 
        overflow: "hidden", 
        marginBottom: "1rem" 
      }}>
        <div
          style={{
            height: "100%",
            borderRadius: "20px",
            width: `${safeScore}%`,
            backgroundColor: getColor(),
            transition: "width 0.4s ease"
          }}
        ></div>
      </div>

      <div style={{ color: getColor(), fontWeight: "700", fontSize: "1.1rem" }}>
        {safeScore}% Productive ({getScoreLabel()})
      </div>
    </div>
  );
}

export default ProductivityMeter;
