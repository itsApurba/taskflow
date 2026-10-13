import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

const useSprints = () =>
  useQuery({
    queryKey: ["sprints"],
    queryFn: async () => {
      const res = await api.get("/sprints");
      return res.data;
    },
  });

export default useSprints;
