import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  if (!!localStorage.getItem("access_token")) {
    return children;
  }
  return <Navigate to="/login" />;
};

export default PrivateRoute;
