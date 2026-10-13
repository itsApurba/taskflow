import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import useAuth from "./useAuth";

// The leaderboard query for Home, Profile and the leaderboard page;
// invalidateMarket refreshes ["leaderboard"] after a payout. Tasks and the team
// come from useMarket.js, and rewards, redemptions and penalties from their own
// hooks.

const get = (url, params) => async () => (await api.get(url, { params })).data;

// Team ranking by credits earned from approved tasks; `period` is "week" or "all".
export const useLeaderboard = (period = "all", { enabled = true } = {}) => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: ["leaderboard", period],
    queryFn: get("/leaderboard", { period }),
    enabled: isLoggedIn && enabled,
    staleTime: 30_000,
  });
};
