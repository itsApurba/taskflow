import {
  LuArchive,
  LuBookOpen,
  LuBug,
  LuCalendarClock,
  LuCircleCheckBig,
  LuCircleDashed,
  LuCrown,
  LuGem,
  LuGift,
  LuHourglass,
  LuRocket,
  LuSparkles,
  LuStar,
  LuStore,
  LuTicket,
  LuTimer,
} from "react-icons/lu";

// Shared vocabulary for tasks and the game layer. Screens read labels, colour
// palettes and icons from here so a status or tier looks the same everywhere.

// Reward tiers colour a task by how many credits it pays, like loot rarity.
// Ordered from the highest threshold down; `min` is inclusive.
export const REWARD_TIERS = [
  { id: "legendary", label: "Legendary", min: 200, palette: "coin", icon: LuCrown },
  { id: "epic", label: "Epic", min: 100, palette: "brand", icon: LuGem },
  { id: "rare", label: "Rare", min: 50, palette: "blue", icon: LuSparkles },
  { id: "common", label: "Common", min: 0, palette: "gray", icon: LuStar },
];

export const getRewardTier = (reward) => REWARD_TIERS.find((tier) => (Number(reward) || 0) >= tier.min);

// Covers the legacy board statuses and the market lifecycle
// (open -> in progress -> in review -> done) from the gamification API.
export const TASK_STATUSES = {
  "not started": { label: "To do", palette: "gray", icon: LuCircleDashed, lane: "todo" },
  open: { label: "Open", palette: "blue", icon: LuStore, lane: "todo" },
  "in progress": { label: "In progress", palette: "brand", icon: LuTimer, lane: "active" },
  "in review": { label: "In review", palette: "orange", icon: LuHourglass, lane: "review" },
  completed: { label: "Completed", palette: "green", icon: LuCircleCheckBig, lane: "done" },
  done: { label: "Done", palette: "green", icon: LuCircleCheckBig, lane: "done" },
  closed: { label: "Closed", palette: "gray", icon: LuArchive, lane: "done" },
};

export const getTaskStatus = (status) => TASK_STATUSES[status] ?? { label: status || "No status", palette: "gray", icon: LuCircleDashed, lane: "todo" };

// Statuses people can pick on the legacy board. Market tasks move through
// their own endpoints instead.
export const BOARD_STATUSES = ["not started", "in progress", "completed", "closed"];

const MARKET_STATUSES = ["open", "in review", "done"];

// Market tasks are posted with a reward and open on their market page, not the
// legacy edit form.
export const isMarketTask = (task) => Boolean(task?.createdBy) || MARKET_STATUSES.includes(task?.status);

export const taskPath = (task) => (isMarketTask(task) ? `/market/${task._id}` : `/task/${task._id}`);

// Lanes group statuses into "what should I do next" buckets.
export const TASK_LANES = [
  { id: "todo", label: "To do" },
  { id: "active", label: "In progress" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" },
];

export const TASK_TYPES = {
  bug: { label: "Bug", palette: "red", icon: LuBug },
  feature: { label: "Feature", palette: "blue", icon: LuRocket },
  story: { label: "Story", palette: "teal", icon: LuBookOpen },
};

export const getTaskType = (type) => TASK_TYPES[type];

// Illustrative rewards until the store is live; the real catalogue comes from each manager.
export const SAMPLE_REWARDS = [
  { title: "Event ticket", cost: 300, icon: LuTicket },
  { title: "Skip a boring festival", cost: 800, icon: LuCalendarClock },
  { title: "Join a special weekend with Rohit sir", cost: 1500, icon: LuGift },
];

// Level n needs 100 * (n - 1)^2 XP, matching the gamification API.
export const xpForLevel = (level) => 100 * Math.max(0, level - 1) ** 2;

// Share of the way from the current level to the next one, 0-1.
export const levelProgress = ({ xp = 0, level = 1, nextLevelXp }) => {
  const floor = xpForLevel(level);
  const ceiling = nextLevelXp ?? xpForLevel(level + 1);
  if (ceiling <= floor) return 1;
  return Math.min(1, Math.max(0, (xp - floor) / (ceiling - floor)));
};

const numberFormat = new Intl.NumberFormat();
export const formatNumber = (value) => numberFormat.format(Number(value) || 0);

// An assignee arrives as an id from board endpoints and as a populated user
// from market endpoints.
export const assigneeId = (task) => (task?.assignee && typeof task.assignee === "object" ? task.assignee._id : task?.assignee) || null;

export const firstName = (name = "") => name.trim().split(/\s+/)[0] || name;

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
