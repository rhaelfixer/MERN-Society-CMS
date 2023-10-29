const jwt = require("jsonwebtoken");
require("dotenv").config();



// Authenticate a user's token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({message: "Unauthorized"});
  }
  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) {
    return res
      .status(401)
      .json({message: "Invalid authorization header format"});
  }
  jwt.verify(token, process.env.SESSION_TOKEN, (err, decodedToken) => {
    if (err) {
      console.log("JWT error:", err);
      return res.status(403).json({message: "Invalid token"});
    }
    req.userId = decodedToken.userId;
    next();
  });
};

module.exports = authenticateToken;
