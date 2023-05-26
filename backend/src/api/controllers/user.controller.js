const User = require("../models/user.model");

exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  const body = { name, email };
  console.log(body);
  try {
    const user = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.searchUser = async (req, res) => {
  let x = 5;
  try {
    const { name } = req.query;
    const users = await User.find(
      {
        $or: [{ name: { $regex: name, $options: "i" } }, { email: { $regex: name, $options: "i" } }],
      },
      { limit: x , name: 1, email: 1 }
    ).select("-password")
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
