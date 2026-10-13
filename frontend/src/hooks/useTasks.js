import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// Every task on the board, newest first. Shares the ["tasks"] cache with the
// forms, which refetch it after saving.
const useTasks = () =>
  useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data.reverse();
    },
  });

export default useTasks;
