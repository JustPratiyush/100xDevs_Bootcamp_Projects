const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = 3000;
const JWT_SECRET = "harkirat123";

app.use(express.json());
app.use(cors());

const users = [];

// SIGN UP
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  users.push({ username, password });

  res.json({
    message: "User signed up successfully",
  });
});

// SIGN IN
app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      username: user.username,
    },
    JWT_SECRET,
  );

  res.json({ token });
});

// AUTH MIDDLEWARE
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.username = decoded.username;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ME ROUTE
app.get("/me", auth, (req, res) => {
  const user = users.find((u) => u.username === req.username);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    username: user.username,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
