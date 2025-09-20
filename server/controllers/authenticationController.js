const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

const authController = async (req, res) => {
  const token = req.headers["authorization"];
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
    }
  });

  return res.status(200).json({ message: true });
};

module.exports = authController;
