const jwt = require("jsonwebtoken");

const validateCredentials = (username, password) => {
  return username === "admin" && password === "1234";
};

const generateToken = () => {
  return jwt.sign(
    { username: "admin", role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!validateCredentials(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken();

  res.json({ token });
};
