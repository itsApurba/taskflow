import moment from "moment";

// Where a sprint is in time: upcoming, active or ended, plus how much of it has elapsed.
export const sprintPhase = (sprint, now = Date.now()) => {
  const start = sprint.startDate ? new Date(sprint.startDate).getTime() : null;
  const end = sprint.endDate ? new Date(sprint.endDate).getTime() : null;
  if (start && now < start) {
    return { id: "upcoming", label: "Upcoming", palette: "xp", progress: 0, note: `Starts ${moment(start).fromNow()}` };
  }
  if (end && now > end) {
    return { id: "ended", label: "Ended", palette: "gray", progress: 1, note: `Ended ${moment(end).fromNow()}` };
  }
  const progress = start && end && end > start ? (now - start) / (end - start) : 0;
  return { id: "active", label: "Active", palette: "brand", progress, note: end ? `Ends ${moment(end).fromNow()}` : "No end date" };
};

const phaseOrder = { active: 0, upcoming: 1, ended: 2 };

// Active sprints first, then upcoming, then ended; soonest end first within each.
export const sortSprints = (sprints = []) =>
  [...sprints].sort((a, b) => {
    const byPhase = phaseOrder[sprintPhase(a).id] - phaseOrder[sprintPhase(b).id];
    if (byPhase) return byPhase;
    return new Date(a.endDate ?? 0) - new Date(b.endDate ?? 0);
  });

export const formatSprintDates = (sprint) =>
  [sprint.startDate, sprint.endDate]
    .filter(Boolean)
    .map((date) => moment(date).format("MMM D"))
    .join(" → ");
