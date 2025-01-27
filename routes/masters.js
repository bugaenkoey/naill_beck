const express = require("express");
const db = require("../models/db.js");

const router = express.Router();

router.get("/", (req, res) => {
  const query = "SELECT * FROM masters";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.post("/register", (req, res) => {
  const { user_id, specialty } = req.body;
  const query = "INSERT INTO masters (user_id, specialty) VALUES (?, ?)";
  db.execute(query, [user_id, specialty], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Master registered successfully" });
  });
});

module.exports = router;
