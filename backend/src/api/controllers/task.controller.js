const Task = require("../models/task.model");

exports.createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).send(newTask);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getTaskByUser = async (req, res) => {
  try {
    const task = await Task.find({ assignee: req.params.id });
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateTask = async (req, res) => {
  const { title, type, description, assignee, status } = req.body;
  const body = { title, type, description, assignee, status };
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const body = { status };
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.updateTaskType = async (req, res) => {
  const { type } = req.body;
  const body = { type };
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // runValidators: true,
    });
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.assignTask = async (req, res) => {
  const userId = req.params.id;
  const taskId = req.params.taskId;
  try {
    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignee: userId },
      {
        new: true,
      }
    );
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
}

exports.searchTasksByName = async (req, res) => {
  const { name } = req.query
  try {
    const tasks = await Task.find({ title: { $regex: name, $options: "i" } }).limit(5);
    res.status(200).send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }  
}