import { LuCalendarRange, LuGift, LuHouse, LuSquareKanban, LuStore, LuTrophy, LuUser, LuWallet } from "react-icons/lu";

// One place for every destination in the app. `paths` decides which item is
// highlighted; `soon` marks screens that still show the "coming soon" page.
// When you build one of those screens, drop its `soon` flag.
export const NAV = {
  home: { to: "/", label: "Home", icon: LuHouse, paths: ["/", "/dashboard"] },
  board: { to: "/tasks", label: "Board", icon: LuSquareKanban, paths: ["/tasks", "/task", "/create-task"] },
  sprints: { to: "/sprints", label: "Sprints", icon: LuCalendarRange, paths: ["/sprints", "/sprint", "/create-sprint"] },
  market: { to: "/market", label: "Market", icon: LuStore, paths: ["/market"], soon: true },
  wallet: { to: "/wallet", label: "Wallet", icon: LuWallet, paths: ["/wallet"], soon: true },
  store: { to: "/store", label: "Store", icon: LuGift, paths: ["/store"], soon: true },
  leaderboard: { to: "/leaderboard", label: "Leaderboard", shortLabel: "Ranks", icon: LuTrophy, paths: ["/leaderboard"] },
  profile: { to: "/profile", label: "Profile", icon: LuUser, paths: ["/profile"] },
};

export const SIDEBAR_GROUPS = [
  { label: "Work", items: [NAV.home, NAV.board, NAV.sprints] },
  { label: "Play", items: [NAV.market, NAV.wallet, NAV.store, NAV.leaderboard] },
];

// Phone tab bar: five slots, Market raised in the middle. The Board tab also
// covers sprints; the wallet lives behind the credit pill in the top bar.
export const TAB_BAR_ITEMS = [
  NAV.home,
  { ...NAV.board, paths: [...NAV.board.paths, ...NAV.sprints.paths] },
  { ...NAV.market, featured: true },
  NAV.store,
  NAV.leaderboard,
];

export const isNavActive = (item, pathname) =>
  item.paths.some((path) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`)));
