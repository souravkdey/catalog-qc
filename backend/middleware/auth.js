const jwt = require("jsonwebtoken");

const extractToken = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 ? parts[1] : null;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
