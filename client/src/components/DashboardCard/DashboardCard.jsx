import "./DashboardCard.css";

function DashboardCard({ title, value, icon, onClick, ariaLabel }) {
  const clickable = typeof onClick === "function";
  const content = (
    <>
      <div className="card-glow"></div>
      <div className="card-left"><h4>{title}</h4><h2>{value}</h2></div>
      <div className="dashboard-icon">{icon}</div>
    </>
  );
  if (clickable) return <button type="button" className="dashboard-card dashboard-card-button" onClick={onClick} aria-label={ariaLabel || `Open ${title}`}>{content}</button>;
  return <div className="dashboard-card">{content}</div>;
}
export default DashboardCard;
