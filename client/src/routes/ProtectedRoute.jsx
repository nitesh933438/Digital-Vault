import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {

    return <h2 style={{ textAlign: "center", marginTop: "100px" }}>Loading...</h2>;

  }

  if (!user) {

    return <Navigate to="/login" />;

  }

  return children;

}

export default ProtectedRoute;