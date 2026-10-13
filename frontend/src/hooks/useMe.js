import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import useAuth from "./useAuth";

// A dropped connection, a timeout or a 5xx may pass; a 4xx answer won't change.
const isTransient = (error) => !error?.response || error.response.status >= 500;

// The signed-in player's profile (credits, XP, level, streak) from GET /me.
// Backends without the gamification API answer 404, which counts as an answer:
// `profile` is then null and game widgets fall back to their "locked" state
// instead of showing fake numbers. Any other failure sets `isLoadError` until
// /me answers, even while a refetch runs, so screens offer a retry instead of
// pretending the game is off or guessing the role.
const useMe = () => {
  const { isLoggedIn } = useAuth();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api.get("/me")).data;
      } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: isLoggedIn,
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
    // A failed /me stays failed until something refetches it on purpose.
    // Otherwise every newly mounted widget re-runs it, flipping the query
    // back to loading, which made pages gated on loading blink.
    retryOnMount: false,
    staleTime: 30_000,
  });
  const profile = query.data && typeof query.data.credits === "number" ? query.data : null;
  const isLoadError = !profile && query.errorUpdatedAt > query.dataUpdatedAt;
  // True only before /me has ever answered. Use it to gate a whole page, so
  // an error or a background refetch never swaps the page for a skeleton.
  const isFirstLoad = query.isLoading && query.dataUpdatedAt === 0 && query.errorUpdatedAt === 0;
  return { ...query, profile, isLoadError, isFirstLoad };
};

export default useMe;
