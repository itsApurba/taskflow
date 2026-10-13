import {
  LuCalendarX,
  LuCircleCheckBig,
  LuCoffee,
  LuGift,
  LuHourglass,
  LuPackageCheck,
  LuPizza,
  LuPlane,
  LuShieldCheck,
  LuTent,
  LuTicket,
  LuUmbrella,
} from "react-icons/lu";

// Vocabulary for the wallet, rewards store, redemptions and penalties, so a
// ledger entry or redemption looks the same on every screen.

// Ledger entry kinds from GET /wallet.
export const LEDGER_KINDS = {
  task_reward: { label: "Task approved", palette: "green", icon: LuCircleCheckBig, prefix: "Task approved: " },
  reward_redeem: { label: "Reward redeemed", palette: "coin", icon: LuGift, prefix: "Redeemed: " },
  penalty_clear: { label: "Penalty cleared", palette: "red", icon: LuShieldCheck, prefix: "Penalty cleared: " },
};

export const getLedgerKind = (kind) => LEDGER_KINDS[kind] ?? { label: "Adjustment", palette: "gray", icon: LuGift, prefix: "" };

// The note without its "Task approved: " style prefix, for a row title.
export const ledgerTitle = (entry) => {
  const { prefix } = getLedgerKind(entry.kind);
  const note = entry.note || "";
  return (prefix && note.startsWith(prefix) ? note.slice(prefix.length) : note) || getLedgerKind(entry.kind).label;
};

export const REDEMPTION_STATUSES = {
  pending: { label: "Pending", palette: "orange", icon: LuHourglass },
  fulfilled: { label: "Fulfilled", palette: "green", icon: LuPackageCheck },
};

export const getRedemptionStatus = (status) => REDEMPTION_STATUSES[status] ?? REDEMPTION_STATUSES.pending;

// Managers name rewards freely, so pick an icon from the words in the title.
const REWARD_ICONS = [
  { match: /ticket|event|pass|conference|concert|movie|show/i, icon: LuTicket },
  { match: /skip|day off|leave|festival|holiday/i, icon: LuCalendarX },
  { match: /weekend|trip|outing|camp/i, icon: LuTent },
  { match: /coffee|tea|chai/i, icon: LuCoffee },
  { match: /lunch|dinner|pizza|food|treat/i, icon: LuPizza },
  { match: /flight|travel|vacation/i, icon: LuPlane },
  { match: /wfh|home|relax|beach/i, icon: LuUmbrella },
];

export const rewardIcon = (title = "") => REWARD_ICONS.find((entry) => entry.match.test(title))?.icon ?? LuGift;

// `stock` is null for unlimited items.
export const isUnlimited = (reward) => reward.stock === null || reward.stock === undefined;
export const isSoldOut = (reward) => !isUnlimited(reward) && reward.stock <= 0;

// The API answers errors as { message }; fall back to a friendly line.
export const apiErrorMessage = (error, fallback = "Something went wrong. Try again.") =>
  error?.response?.data?.message ?? (error?.code === "ECONNABORTED" ? "The server took too long to answer." : fallback);
