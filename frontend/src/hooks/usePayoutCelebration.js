import { useEffect, useState } from "react";

const storageKey = (userId) => `taskflow:payouts-seen:${userId}`;

const readSeen = (userId) => {
  try {
    return localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
};

const writeSeen = (userId, value) => {
  try {
    localStorage.setItem(storageKey(userId), value);
  } catch {
    // Private mode or blocked storage: the celebration just shows again.
  }
};

// A worker learns about payouts the next time they open the market: tasks
// approved since their last visit are celebrated once. The first visit only
// records "now", so old history never pops up.
const usePayoutCelebration = (userId, tasks) => {
  const [dismissedAt, setDismissedAt] = useState(null);
  const seen = userId ? (dismissedAt ?? readSeen(userId)) : null;
  const firstVisit = Boolean(userId && tasks) && !seen;

  useEffect(() => {
    if (firstVisit) writeSeen(userId, new Date().toISOString());
  }, [firstVisit, userId]);

  if (!userId || !tasks || !seen) return { payouts: [], dismiss: () => {} };
  const payouts = tasks.filter((task) => task.status === "done" && task.approvedAt && task.approvedAt > seen);
  const dismiss = () => {
    const latest = payouts.reduce((max, task) => (task.approvedAt > max ? task.approvedAt : max), seen);
    writeSeen(userId, latest);
    setDismissedAt(latest);
  };
  return { payouts, dismiss };
};

export default usePayoutCelebration;
