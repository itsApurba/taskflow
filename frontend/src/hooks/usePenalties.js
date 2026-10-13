import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// A worker's penalties, or the ones a manager issued. Newest first.
const usePenalties = (options) =>
  useQuery({
    queryKey: ["penalties"],
    queryFn: async () => (await api.get("/penalties")).data,
    ...options,
  });

export default usePenalties;
