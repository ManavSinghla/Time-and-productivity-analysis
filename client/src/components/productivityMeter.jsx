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
    <div className="productivity-meter-card">
      <h3 className="productivity-title">📊 Productivity Meter</h3>

      <div className="productivity-bar-container">
        <div
          className="productivity-bar"
          style={{
            width: `${safeScore}%`,
            backgroundColor: getColor(),
          }}
        >
          {safeScore > 10 && <span>{safeScore}%</span>}
        </div>
      </div>

      <div className="productivity-score" style={{ color: getColor() }}>
        {safeScore}% Productive ({getScoreLabel()})
      </div>
    </div>
  );
}

export default ProductivityMeter;
