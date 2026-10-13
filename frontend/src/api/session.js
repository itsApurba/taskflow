import useAuth from "../hooks/useAuth";
import { toaster } from "../components/ui/toaster";
import queryClient from "./queryClient";

// Ends the session: forgets the token and the signed-in user and drops every
// cached query, so PrivateRoute sends the next screen to /login.
export const endSession = () => {
  useAuth.getState().setIsLoggedIn(false);
  localStorage.removeItem("access_token");
  queryClient.clear();
};

// A 401 on a signed-in request means the token is expired or its user is
// gone. Log out once (parallel requests all fail together) and say why.
export const endExpiredSession = () => {
  if (!useAuth.getState().isLoggedIn) return;
  endSession();
  toaster.create({ title: "Your session has ended", description: "Log in again to pick up where you left off.", type: "info" });
};
