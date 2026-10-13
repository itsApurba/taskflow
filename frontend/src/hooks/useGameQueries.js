import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import useAuth from "./useAuth";

// Read-only queries for the game screens (home, profile, leaderboard). Keys
// match the screens that change this data, so their invalidations reach here:
// ["leaderboard"] after a payout, ["rewards"], ["redemptions"] and
// ["penalties"] for the store and wallet. Every key holds the raw API response.
// Task and team queries live in useMarket.js.

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

// Workers: the manager's live rewards. Managers: everything they stock.
export const useRewards = ({ enabled = true } = {}) => useQuery({ queryKey: ["rewards"], queryFn: get("/rewards"), enabled });

// Workers: their redemptions. Managers: redemptions of their rewards.
export const useRedemptions = ({ enabled = true } = {}) =>
  useQuery({ queryKey: ["redemptions"], queryFn: get("/redemptions"), enabled });

// Workers: their penalties. Managers: the ones they issued.
export const usePenalties = ({ enabled = true } = {}) =>
  useQuery({ queryKey: ["penalties"], queryFn: get("/penalties"), enabled });
