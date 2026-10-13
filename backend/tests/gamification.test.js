const { test } = require("node:test");
const { expect } = require("expect");
const { levelForXp, xpForLevel, nextStreak, currentStreak } = require("../src/api/utils/gamification");

const day = (n) => new Date(Date.UTC(2026, 9, n, 12));

test("levels follow 100 * (level - 1)^2 XP", () => {
  expect(levelForXp(0)).toBe(1);
  expect(levelForXp(99)).toBe(1);
  expect(levelForXp(100)).toBe(2);
  expect(levelForXp(399)).toBe(2);
  expect(levelForXp(400)).toBe(3);
  expect(xpForLevel(4)).toBe(900);
});

test("streak counts consecutive days with an approval", () => {
  expect(nextStreak(0, null, day(10))).toBe(1);
  expect(nextStreak(1, day(10), day(10))).toBe(1);
  expect(nextStreak(1, day(10), day(11))).toBe(2);
  expect(nextStreak(5, day(10), day(13))).toBe(1);
});

test("a streak lapses after a full day without approvals", () => {
  expect(currentStreak(3, day(10), day(11))).toBe(3);
  expect(currentStreak(3, day(10), day(12))).toBe(0);
  expect(currentStreak(0, null, day(12))).toBe(0);
});
