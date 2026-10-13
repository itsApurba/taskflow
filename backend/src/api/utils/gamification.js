/**
 * Gamification rules.
 *
 * XP: a worker gains XP equal to the credit reward of every approved task.
 *
 * Levels: level = floor(sqrt(xp / 100)) + 1, so reaching level n needs
 * 100 * (n - 1)^2 XP (level 2 at 100 XP, level 3 at 400, level 4 at 900, ...).
 *
 * Streak: the number of consecutive calendar days (UTC) on which the worker
 * had at least one task approved. A second approval on the same day keeps the
 * streak, an approval the day after extends it, and a gap resets it to 1.
 * A streak whose last approval is older than yesterday reads as 0.
 */
const XP_PER_LEVEL_UNIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

const levelForXp = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / XP_PER_LEVEL_UNIT)) + 1;

const xpForLevel = (level) => XP_PER_LEVEL_UNIT * (level - 1) ** 2;

const utcDay = (date) => Math.floor(new Date(date).getTime() / DAY_MS);

/** Streak after an approval at `now`, given the previous streak state. */
const nextStreak = (streak, lastApprovedAt, now = new Date()) => {
  if (!lastApprovedAt) return 1;
  const gap = utcDay(now) - utcDay(lastApprovedAt);
  if (gap <= 0) return Math.max(streak, 1);
  if (gap === 1) return streak + 1;
  return 1;
};

/** Streak as it stands at `now`: 0 once a full day has passed without an approval. */
const currentStreak = (streak, lastApprovedAt, now = new Date()) => {
  if (!lastApprovedAt) return 0;
  return utcDay(now) - utcDay(lastApprovedAt) <= 1 ? streak : 0;
};

module.exports = { levelForXp, xpForLevel, nextStreak, currentStreak };
