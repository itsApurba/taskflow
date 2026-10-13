import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// The store, cheapest first: a worker gets their manager's live rewards, a
// manager everything they stock (hidden items included).
const useRewards = (options) =>
  useQuery({
    queryKey: ["rewards"],
    queryFn: async () => (await api.get("/rewards")).data,
    ...options,
  });

export default useRewards;
