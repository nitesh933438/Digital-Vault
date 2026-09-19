import { Link } from "react-router-dom";
import BackButton from "../../components/BackButton/BackButton";

function NotFound(){
  return (
    <div className="not-found-page" style={{padding:"48px 24px",minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--bg)",color:"var(--text)"}}>
      <div style={{textAlign:"center",maxWidth:520}}>
        <BackButton label="Go Back" />
        <h1 style={{fontSize:"clamp(56px,10vw,96px)",margin:"24px 0 8px"}}>404</h1>
        <p style={{fontSize:18,opacity:.75,marginBottom:24}}>Page Not Found</p>
        <Link to="/dashboard" style={{display:"inline-flex",padding:"12px 18px",borderRadius:12,background:"linear-gradient(135deg,#2563eb,#4f46e5)",color:"#fff",fontWeight:700}}>Go to Dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
