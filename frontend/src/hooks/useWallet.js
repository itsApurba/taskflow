import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// Balance, earned/spent totals and the ledger (newest first) from GET /wallet.
const useWallet = () =>
  useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await api.get("/wallet")).data,
  });

export default useWallet;
