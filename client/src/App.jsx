import './App.css'
import TaskList from "./components/taskList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Time and Productivity Analysis</h1>
      <AnalyticsDashboard />
      <TaskList />
    </div>
  );
}

export default App;