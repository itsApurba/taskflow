import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// One person by id from GET /users/:id, for naming an assignee the task
// arrived without populated.
const useUser = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
    enabled: Boolean(id) && enabled,
  });

export default useUser;
