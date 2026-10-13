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
    // A failed /me stays failed until something refetches it on purpose.
    // Otherwise every newly mounted widget re-runs it, flipping the query
    // back to loading, which made pages gated on loading blink.
    retryOnMount: false,
    staleTime: 30_000,
  });
  const profile = query.data && typeof query.data.credits === "number" ? query.data : null;
  // True only before /me has ever answered. Use it to gate a whole page, so
  // an error or a background refetch never swaps the page for a skeleton.
  const isFirstLoad = query.isLoading && query.dataUpdatedAt === 0 && query.errorUpdatedAt === 0;
  return { ...query, profile, isFirstLoad };
};

export default useMe;
