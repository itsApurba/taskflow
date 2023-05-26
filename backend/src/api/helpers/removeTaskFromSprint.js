const Sprint = require('../models/sprint.model')

async function removeTaskFromSprint(sprintId, taskId) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
        throw new Error("Sprint not found");
    }

    const taskIndex = sprint.tasks.findIndex((task) => task._id.toString() === taskId);

    if (taskIndex === -1) {
        throw new Error("Task not found in the sprint");
    }

    sprint.tasks.splice(taskIndex, 1);
    await sprint.save();
}

module.exports = removeTaskFromSprint