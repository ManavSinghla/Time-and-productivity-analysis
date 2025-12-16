import './App.css';
import Login from "./components/login";
import Register from "./components/register";
import TaskList from "./components/TaskList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Time and Productivity Analysis</h1>

      <Register />
      <Login />
      <AnalyticsDashboard />
      <TaskList />
    </div>
  );
}

export default App;
