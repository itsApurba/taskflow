import { useQueryClient } from "@tanstack/react-query";
import useAuth from "./useAuth";

// Signs out: forgets the token and the signed-in user, and drops every cached
// query so the next person starts clean.
const useLogout = () => {
  const { setIsLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  return () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    queryClient.clear();
  };
};

export default useLogout;
