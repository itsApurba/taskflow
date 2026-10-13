import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// A manager's reports with their game stats (GET /users/team). Managers only.
const useTeam = (options) =>
  useQuery({
    queryKey: ["team"],
    queryFn: async () => (await api.get("/users/team")).data,
    ...options,
  });

export default useTeam;
