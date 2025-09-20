const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const authentication = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token || typeof token != "string" || token.trim() === "") {
    return res.status(401).json({ message: "unauthorized" });
  } else {
    const authToken = token.split(" ")[1];

    if (
      authToken == undefined ||
      typeof authToken != "string" ||
      !token.startsWith("Bearer ")
    ) {
      return res.status(400).json({ message: "Bad Request" });
    }

    jwt.verify(authToken, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      } else {
        next();
      }
    });
  }
};

module.exports = authentication;