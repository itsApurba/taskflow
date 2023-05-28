import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuth = create(
  persist((set) => ({
    isLoggedIn: false,
    userName: "",
    userEmail: "",
    userId: "",
    setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),
    setUserName: (value) => set(() => ({ userName: value })),
    setUserEmail: (value) => set(() => ({ userEmail: value })),
    setUserId: (value) => set(() => ({ userId: value })),
  }), {
    name: "auth",
    storage: createJSONStorage(() => localStorage),
  })
);

export default useAuth;
