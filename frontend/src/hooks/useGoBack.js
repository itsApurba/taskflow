import { useNavigate } from "react-router-dom";

// Back to the previous screen, or to `fallback` when this page was opened
// directly (a shared link or a refresh) and there is no in-app history.
const useGoBack = (fallback = "/") => {
  const navigate = useNavigate();
  return () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(fallback, { replace: true }));
};

export default useGoBack;
