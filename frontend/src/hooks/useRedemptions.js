import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// A worker's own redemptions, or the redemptions of a manager's rewards. Newest first.
const useRedemptions = () =>
  useQuery({
    queryKey: ["redemptions"],
    queryFn: async () => (await api.get("/redemptions")).data,
  });

export default useRedemptions;
