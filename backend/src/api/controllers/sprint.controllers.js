const addTaskTosprint = require("../helpers/addTaskTosprint");
const removeTaskFromSprint = require("../helpers/removeTaskFromSprint");
const Sprint = require("../models/sprint.model");

exports.createSprint = async (req, res) => {
    try {
      const sprint = new Sprint(req.body);
      await sprint.save();
      res.status(201).json(sprint);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find();
    res.status(200).json(sprints);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    res.status(200).json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if(!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    res.status(200).json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if(!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    res.status(200).json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
exports.addTasksToSprint = async (req, res) => {
   try {
     const { taskId } = req.body;
     await addTaskTosprint(req.params.id, taskId);
     res.status(201).json({ message: "Task added to sprint" });
   } catch (error) {
     res.status(400).json({ message: error.message });
   }
}

exports.deleteTaskFromSprint = async (req, res) => {
  try{
    const { taskId } = req.body;
    await removeTaskFromSprint(req.params.id, taskId);
    res.status(201).json({ message: "Task removed from sprint" });
  }catch(error){
    res.status(400).json({ message: error.message });
  }
}