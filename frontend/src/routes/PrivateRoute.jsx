import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {

  const {isLoggedIn} = useAuth()
  const location = useLocation();

  if (isLoggedIn) {
    return children;
  }
  return <Navigate to="/login" state={{ from: location.pathname }} replace/>;
};

export default PrivateRoute;
