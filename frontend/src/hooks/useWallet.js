import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Balance, earned/spent totals and the ledger (newest first) from GET /wallet.
// A balance that differs from the cached profile means credits moved elsewhere
// (a manager approved a task, say), so /me is refreshed too: the credit pill,
// XP and level then match the wallet instead of waiting out their stale time.
const useWallet = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const wallet = (await api.get("/wallet")).data;
      const me = queryClient.getQueryData(["me"]);
      if (typeof me?.credits === "number" && me.credits !== wallet.balance) queryClient.invalidateQueries({ queryKey: ["me"] });
      return wallet;
    },
  });
};

export default useWallet;
