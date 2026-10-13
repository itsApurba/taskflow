import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import useAuth from "./useAuth";

// The signed-in player's profile (credits, XP, level, streak) from GET /me.
// Backends without the gamification API answer 404; `profile` is then null and
// game widgets fall back to their "locked" state instead of showing fake numbers.
const useMe = () => {
  const { isLoggedIn } = useAuth();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/me")).data,
    enabled: isLoggedIn,
    retry: false,
    staleTime: 30_000,
  });
  const profile = query.data && typeof query.data.credits === "number" ? query.data : null;
  return { ...query, profile };
};

export default useMe;
