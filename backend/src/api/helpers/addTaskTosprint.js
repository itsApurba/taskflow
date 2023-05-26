const Sprint = require("../models/sprint.model");

async function addTaskTosprint(sprintId, taskId) {
  const sprint = await Sprint.findById(sprintId);
  if (!sprint) {
    throw new Error("Sprint not found");
  }

  const taskIndex = sprint.tasks.findIndex((task) => task._id.toString() === taskId);

  if (taskIndex !== -1) {
    throw new Error("Task already exists in the sprint");
  }

  sprint.tasks.push({
    _id: taskId,
  });
  await sprint.save();
}

module.exports = addTaskTosprint;
