import "./ThemeToggle.css";
import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {

  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title="Change Theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );

}

export default ThemeToggle;