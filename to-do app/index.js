const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 3001;
const JWT_SECRET = "supersecret";

app.use(express.json());
app.use(cors());

const users = [];

function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Not logged in" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.username = decoded.username;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
}

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password, todos: [] });
  res.json({ message: "Signup successful" });
});

app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ token });
});

app.get("/todos", auth, (req, res) => {
  const user = users.find((u) => u.username === req.username);
  res.json(user.todos);
});

app.post("/todos", auth, (req, res) => {
  const user = users.find((u) => u.username === req.username);

  const todo = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
  };

  user.todos.push(todo);
  res.json(todo);
});

app.put("/todos/:id", auth, (req, res) => {
  const user = users.find((u) => u.username === req.username);
  const todo = user.todos.find((t) => t.id == req.params.id);

  if (!todo) return res.status(404).json({ message: "Todo not found" });

  todo.completed = req.body.completed;
  res.json(todo);
});

app.delete("/todos/:id", auth, (req, res) => {
  const user = users.find((u) => u.username === req.username);
  user.todos = user.todos.filter((t) => t.id != req.params.id);
  res.json({ message: "Todo deleted" });
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
