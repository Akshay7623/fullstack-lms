const express = require("express");
const authentication = express.Router();
const authController = require("../controllers/authenticationController.js");

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token || typeof token != "string" || token.trim() === "") {
    return res.status(401).json({ message: "unauthorized" });
  }
  next();
};

authentication.post("/", authMiddleware, authController);

module.exports = authentication;
