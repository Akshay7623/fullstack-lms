const path = require("path");
const express = require("express");

const authentication = require("../middlewares/authMiddleware.js");
const { isNonEmptyString } = require("../utils/validation.js");

const ModuleController = require("../controllers/ModuleController.js");

const moduleRouter = express.Router();

const updateModuleMiddleware = async (req, res, next) => {
  const { name, _id } = req.body;
  if (!isNonEmptyString(name) || !isNonEmptyString(_id)) {
    return res.status(400).json({ message: "Bad data" });
  } else {
    next();
  }
};

const addModuleMiddleware = async (req, res, next) => {
  const { name } = req.body;
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Bad data" });
  } else {
    next();
  }
};

const deleteModuleMiddleware = async (req, res, next) => {
  const { _id } = req.query;

  if (!isNonEmptyString(_id)) {
    return res.status(400).json({ message: "Module Not found" });
  } else {
    next();
  }
};

moduleRouter.post("/add",authentication,addModuleMiddleware, ModuleController.addModuleController);
moduleRouter.get("/get", authentication, ModuleController.getModuleController);
moduleRouter.put("/update", authentication, updateModuleMiddleware, ModuleController.updateModuleController);
moduleRouter.delete("/delete", authentication, deleteModuleMiddleware, ModuleController.deleteModuleController);

module.exports = moduleRouter;
