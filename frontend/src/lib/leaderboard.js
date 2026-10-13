import { firstName, formatNumber } from "./game";

// Leaderboard helpers shared by the leaderboard, home and profile screens.

export const LEADERBOARD_PERIODS = [
  { value: "week", label: "This week", phrase: "this week" },
  { value: "all", label: "All time", phrase: "all time" },
];

// Medal colours for the podium places: gold, silver, bronze. `palette` tints
// surfaces around a place; `solid`/`contrast` paint the medal itself.
export const RANK_MEDALS = {
  1: { palette: "coin", solid: "coin.solid", contrast: "coin.contrast" },
  2: { palette: "gray", solid: "gray.400", contrast: "gray.950" },
  3: { palette: "orange", solid: "orange.solid", contrast: "orange.contrast" },
};

export const periodPhrase = (period) => LEADERBOARD_PERIODS.find((p) => p.value === period)?.phrase ?? "";

const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const ordinalSuffixes = { one: "st", two: "nd", few: "rd", other: "th" };
export const ordinal = (n) => `${n}${ordinalSuffixes[ordinalRules.select(n)]}`;

export const findEntry = (entries = [], userId) => entries.find((entry) => entry.user?._id === userId);

// One line on where you stand: who to catch next, or how far ahead you are.
export const standingNote = (entries = [], me) => {
  if (!me) return null;
  const index = entries.indexOf(me);
  if (me.points === 0) return "Get a task approved to score your first points.";
  if (index > 0) {
    const ahead = entries[index - 1];
    const gap = ahead.points - me.points;
    const name = firstName(ahead.user?.name) || "the next spot";
    return gap > 0 ? `${formatNumber(gap)} credits behind ${name}.` : `Level with ${name}; more XP breaks the tie.`;
  }
  const next = entries[1];
  if (!next || next.points === 0) return "Top of the team. Nobody else has scored yet.";
  const lead = me.points - next.points;
  return lead > 0 ? `Top of the team, ${formatNumber(lead)} credits clear.` : "Tied on credits; your XP keeps you on top.";
};
