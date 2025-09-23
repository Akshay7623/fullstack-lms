const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const authentication = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token || typeof token != "string" || token.trim() === "") {
    return res.status(401).json({ valid: false });
  } else {
    const authToken = token.split(" ")[1];

    if (
      authToken == undefined ||
      typeof authToken != "string" ||
      !token.startsWith("Bearer ")
    ) {
      return res.status(400).json({ valid: false });
    }

    jwt.verify(authToken, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ valid: false });
      } else {
        next();
      }
    });
  }
};

module.exports = authentication;