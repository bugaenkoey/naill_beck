const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
// const secretKey = "your_secret_key";
// const secretKey = process.env.JWT_SECRET_KEY;
const secretKey = process.env.JWT_SECRET_KEY;

// const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  const query = "SELECT * FROM users";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.get("/:client_id", (req, res) => {
  const { client_id } = req.params;
  const query = `SELECT id, username, tel FROM users
  WHERE users.id = ?`;

  db.execute(query, [client_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.post("/register", async (req, res) => {
  const { username, password, tel } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = "INSERT INTO users (username, password,tel) VALUES (?, ?, ?)";
  db.execute(query, [username, hashedPassword, tel], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "User registered successfully" });
  });
});

router.post("/login", (req, res) => {
  // const { username, password } = req.body;
  // const query = "SELECT * FROM users WHERE username = ?";
  // db.execute(query, [username], async (err, results) => {

  const { tel, password } = req.body;
  const query = "SELECT * FROM users WHERE tel = ?";
  db.execute(query, [tel], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "2h" }); // Генеруємо токен

    res.cookie("jwt_token", token, {
      httpOnly: true,
      secure: false, // Встановити `true`, якщо використовуєш HTTPS
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 години
    });

    res.status(200).json({ token: token, message: "Login successful" });
  });
});

module.exports = router;
