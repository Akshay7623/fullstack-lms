const jwt = require("jsonwebtoken");
const admin = require("../models/admin");
const SECRET_KEY = process.env.SECRET_KEY;

const loginController = async (req, res) => {
  const { userName, password } = req.body;
  const data = await admin.findOne({ userName: userName });
  
  if (data && data.userName === userName && data.password === password) {
    const token = jwt.sign({ id: data.id }, SECRET_KEY, {expiresIn : '48h'});
    return res.status(200).json({token: token});
  } else {
    return res.status(401).json({ message: "Wrong username or password" });
  }
};

module.exports = loginController;
