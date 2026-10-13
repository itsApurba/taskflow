import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import useAuth from "./useAuth";
import useMe from "./useMe";

// Data for the task market and the claim -> submit -> approve lifecycle.
// Keys live under ["market"] and ["tasks", ...] so the board's ["tasks"]
// refetches also refresh them.

const MARKET_KEY = ["market"];
const MINE_KEY = ["tasks", "mine"];
const REVIEW_KEY = ["tasks", "review"];

// Open tasks of your team's manager (a manager sees their own), newest first.
export const useMarket = () => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: MARKET_KEY,
    queryFn: async () => (await api.get("/market")).data,
    enabled: isLoggedIn,
  });
};

// Workers: tasks assigned to them. Managers: tasks they posted.
export const useMyTasks = () => {
  const { isLoggedIn } = useAuth();
  return useQuery({
    queryKey: MINE_KEY,
    queryFn: async () => (await api.get("/tasks/mine")).data,
    enabled: isLoggedIn,
  });
};

// Managers: their tasks waiting for review, oldest submission first.
export const useReviewQueue = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: REVIEW_KEY,
    queryFn: async () => (await api.get("/tasks/review")).data,
    enabled,
  });

// Managers: their reports, used to name assignees on unpopulated tasks.
export const useTeam = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: ["users", "team"],
    queryFn: async () => (await api.get("/users/team")).data,
    enabled,
    staleTime: 60_000,
  });

const findCached = (queryClient, id) => {
  for (const key of [MARKET_KEY, MINE_KEY, REVIEW_KEY]) {
    const hit = queryClient.getQueryData(key)?.find((task) => task._id === id);
    if (hit) return hit;
  }
  return undefined;
};

// One task by id (market or board). Starts from a populated copy in the market
// caches when there is one, and always refetches GET /tasks/:id so the status
// is current.
export const useMarketTask = (id, { enabled = true } = {}) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => (await api.get(`/tasks/${id}`)).data,
    enabled: Boolean(id) && enabled,
    retry: false,
    placeholderData: () => findCached(queryClient, id),
  });
};

// A person on a task arrives populated from market endpoints and as an id from
// GET /tasks/:id. Resolve the id from what the viewer already knows: themself,
// their manager, or (for managers) their team.
export const usePersonName = (person) => {
  const { profile } = useMe();
  const isManager = profile?.role === "manager";
  const id = person && typeof person === "object" ? person._id : person;
  const team = useTeam({ enabled: Boolean(id) && isManager && typeof person !== "object" });
  if (!id) return null;
  if (typeof person === "object" && person.name) return person.name;
  if (profile && id === profile._id) return profile.name;
  if (profile?.manager && id === profile.manager._id) return profile.manager.name;
  return team.data?.find((member) => member._id === id)?.name ?? null;
};

// Everything that changes when a task moves: lists, the task itself, and the
// player numbers (credits, XP, streak) that a payout touches.
export const invalidateMarket = (queryClient) =>
  Promise.all(
    [MARKET_KEY, ["tasks"], ["me"], ["wallet"], ["leaderboard"], ["users", "team"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );

// Lifecycle and editing actions. Each resolves with the updated task.
export const useTaskAction = (action) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const requests = {
        claim: () => api.post(`/tasks/${id}/claim`),
        submit: () => api.post(`/tasks/${id}/submit`, { note: body.note || undefined }),
        approve: () => api.post(`/tasks/${id}/approve`),
        reject: () => api.post(`/tasks/${id}/reject`, { note: body.note }),
        create: () => api.post("/tasks", body),
        update: () => api.patch(`/tasks/${id}`, body),
        delete: () => api.delete(`/tasks/${id}`),
      };
      return (await requests[action]()).data;
    },
    onSettled: () => invalidateMarket(queryClient),
  });
};

// The API's message for a failed request, or a fallback.
export const errorMessage = (error, fallback = "Please try again.") => error?.response?.data?.message ?? fallback;
