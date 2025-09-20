const Module = require("../models/module");

const addModuleController = async (req, res) => {
  const { name } = req.body;

  try {
    const newModule = new Module({ name: name });
    const save = await newModule.save();
    return res.status(200).json({ message: "New module added", data: save });
  } catch (Err) {
    return res.status(500).json({ message: "Internal server error !" });
  }
};

const getModuleController = async (req, res) => {
  const data = await Module.find({});
  return res.status(200).json({ data: data });
};

const updateModuleController = async (req, res) => {
  const { _id, name } = req.body;

  try {
    const updated = await Module.findByIdAndUpdate( _id, { name });

    if (!updated) {
      return res.status(404).json({ message: "Module not found" });
    }

    return res.status(200).json({ message: "Module updated", data: updated });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error !" });
  }
};

const deleteModuleController = async (req, res) => {

  const { _id } = req.query;

  try {
    const deleted = await Module.findByIdAndDelete(_id);

    if (!deleted) {
      return res.status(404).json({ message: "Module not found" });
    }
    return res.status(200).json({ message: "Module deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error !" });
  }
};

module.exports = {
  addModuleController,
  getModuleController,
  updateModuleController,
  deleteModuleController,
};
