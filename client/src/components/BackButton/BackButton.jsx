import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton({ label = "Back" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const text = String(label).toLowerCase();
    if (text.includes("home")) {
      navigate("/");
      return;
    }
    if (text.includes("dashboard")) {
      navigate("/dashboard");
      return;
    }
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <button type="button" className="page-back-button" onClick={handleBack} aria-label={label}>
      <FaArrowLeft aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
