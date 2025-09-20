const Module = require("../models/module");

const getCourse = async (req, res) => {
  const data = await Module.find({});
  return res.status(200).json({ data: data });
};

module.exports = getCourse;
