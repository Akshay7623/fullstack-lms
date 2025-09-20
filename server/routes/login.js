const express = require("express");
const login = express.Router();
const loginController = require("../controllers/loginController.js");

const loginMiddleware = async (req, res, next) => {
    const { userName, password } = req.body;
    
    if (typeof (userName) === "string" && userName.trim().length >= 6 &&
        typeof (password) === "string" && password.trim().length >= 8) {
        next();
    } else {
        return res.status(400).json({ message: "Invalid username or password" }); 
    }
};


login.post("/", loginMiddleware, loginController);
module.exports = login;
